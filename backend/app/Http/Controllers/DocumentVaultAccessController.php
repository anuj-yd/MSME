<?php

namespace App\Http\Controllers;

use App\Mail\DocumentVaultOtpMail;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class DocumentVaultAccessController extends Controller
{
    private const OTP_EXPIRES_MINUTES = 5;
    private const OTP_RESEND_COOLDOWN_SECONDS = 60;
    private const UNLOCK_MINUTES = 15;

    public function status(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'document_vault' => $this->vaultState($user),
        ]);
    }

    public function requestOtp(Request $request)
    {
        $user = $request->user();

        $this->sendOtp($user);

        return response()->json([
            'message' => 'OTP sent to your registered email.',
            'expires_minutes' => self::OTP_EXPIRES_MINUTES,
            'document_vault' => $this->vaultState($user->fresh() ?: $user),
        ]);
    }

    public function verify(Request $request)
    {
        $data = $request->validate([
            'otp' => ['required', 'string', 'size:4', 'regex:/^[0-9]{4}$/'],
        ]);

        $user = $request->user();
        $expiresAt = $user->document_vault_otp_expires_at;

        if (! $user->document_vault_otp_hash || ! $expiresAt || CarbonImmutable::parse($expiresAt)->isPast()) {
            throw ValidationException::withMessages([
                'otp' => ['OTP expired. Please request a new OTP.'],
            ]);
        }

        if (! Hash::check($data['otp'], (string) $user->document_vault_otp_hash)) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid OTP.'],
            ]);
        }

        $user->document_vault_otp_hash = null;
        $user->document_vault_otp_expires_at = null;
        $user->document_vault_unlocked_until = CarbonImmutable::now()->addMinutes(self::UNLOCK_MINUTES);
        $user->save();

        return response()->json([
            'message' => 'Document vault unlocked.',
            'document_vault' => $this->vaultState($user),
        ]);
    }

    private function sendOtp(User $user): void
    {
        $now = CarbonImmutable::now();

        if ($user->document_vault_otp_last_sent_at) {
            $lastSent = CarbonImmutable::parse($user->document_vault_otp_last_sent_at);
            if ($lastSent->diffInSeconds($now) < self::OTP_RESEND_COOLDOWN_SECONDS) {
                throw ValidationException::withMessages([
                    'otp' => ['Please wait before requesting another OTP.'],
                ]);
            }
        }

        $otp = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);

        $user->document_vault_otp_hash = Hash::make($otp);
        $user->document_vault_otp_expires_at = $now->addMinutes(self::OTP_EXPIRES_MINUTES);
        $user->document_vault_otp_last_sent_at = $now;
        $user->save();

        $appName = (string) config('app.name', 'Renewal Portal');

        Mail::to($user->email)->send(new DocumentVaultOtpMail(
            otp: $otp,
            expiresMinutes: self::OTP_EXPIRES_MINUTES,
            appName: $appName,
        ));
    }

    private function vaultState(User $user): array
    {
        $unlockedUntil = $user->document_vault_unlocked_until;
        $unlocked = $unlockedUntil && CarbonImmutable::parse($unlockedUntil)->isFuture();

        return [
            'unlocked' => (bool) $unlocked,
            'unlocked_until' => $unlocked ? $unlockedUntil : null,
        ];
    }
}
