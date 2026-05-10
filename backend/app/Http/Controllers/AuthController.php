<?php

namespace App\Http\Controllers;

use App\Mail\RegistrationSuccessfulMail;
use App\Mail\VerifyEmailOtpMail;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const OTP_EXPIRES_MINUTES = 10;
    private const OTP_RESEND_COOLDOWN_SECONDS = 60;

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:6', 'max:100'],
        ]);

        $email = mb_strtolower(trim($data['email']));

        $existing = User::query()->where('email', $email)->first();

        if ($existing) {
            if ($existing->email_verified_at) {
                throw ValidationException::withMessages([
                    'email' => ['Email already registered. Please login.'],
                ]);
            }

            $existing->name = $data['name'];
            $existing->password = $data['password'];
            $existing->save();

            $this->sendOtp($existing, force: false);

            return response()->json([
                'message' => 'OTP sent. Please verify your email to complete registration.',
                'email' => $email,
                'requires_otp' => true,
            ]);
        }

        $user = new User();
        $user->name = $data['name'];
        $user->email = $email;
        $user->password = $data['password'];
        $user->email_verified_at = null;
        $user->save();

        $this->sendOtp($user, force: true);

        return response()->json([
            'message' => 'OTP sent. Please verify your email to complete registration.',
            'email' => $email,
            'requires_otp' => true,
        ], 201);
    }

    public function resendOtp(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $email = mb_strtolower(trim($data['email']));
        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            return response()->json(['message' => 'If the account exists, OTP has been sent.'], 200);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified. Please login.'], 400);
        }

        $this->sendOtp($user, force: false);

        return response()->json(['message' => 'OTP sent.'], 200);
    }

    public function verifyOtp(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
            'otp' => ['required', 'string', 'size:4', 'regex:/^[0-9]{4}$/'],
        ]);

        $email = mb_strtolower(trim($data['email']));
        $otp = $data['otp'];

        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or OTP.'],
            ]);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified. Please login.']);
        }

        $expiresAt = $user->email_otp_expires_at;

        if (! $user->email_otp_hash || ! $expiresAt || CarbonImmutable::parse($expiresAt)->isPast()) {
            throw ValidationException::withMessages([
                'otp' => ['OTP expired. Please request a new OTP.'],
            ]);
        }

        if (! Hash::check($otp, (string) $user->email_otp_hash)) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid OTP.'],
            ]);
        }

        $user->email_verified_at = now();
        $user->email_otp_hash = null;
        $user->email_otp_expires_at = null;
        $user->save();

        $appName = (string) config('app.name', 'Renewal Portal');
        Mail::to($user->email)->send(new RegistrationSuccessfulMail(
            name: (string) ($user->name ?? 'User'),
            appName: $appName,
        ));

        return response()->json(['message' => 'Email verified. You can now login.']);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $email = mb_strtolower(trim($data['email']));

        $user = User::query()->where('email', $email)->first();

        if (! $user || ! Hash::check($data['password'], (string) $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        if (! $user->email_verified_at) {
            $this->sendOtp($user, force: false);

            return response()->json([
                'message' => 'Email not verified. OTP sent.',
                'email' => $email,
                'requires_otp' => true,
            ], 403);
        }

        $plainToken = bin2hex(random_bytes(24));
        $user->api_token_hash = hash('sha256', $plainToken);
        $user->api_token_created_at = now();
        $user->save();

        return response()->json([
            'token' => $plainToken,
            'user' => [
                'id' => (string) $user->getKey(),
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
            ],
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => (string) $user->getKey(),
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        $user->api_token_hash = null;
        $user->api_token_created_at = null;
        $user->save();

        return response()->json(['message' => 'Logged out.']);
    }

    private function sendOtp(User $user, bool $force): void
    {
        $now = CarbonImmutable::now();

        if (! $force && $user->otp_last_sent_at) {
            $lastSent = CarbonImmutable::parse($user->otp_last_sent_at);
            if ($lastSent->diffInSeconds($now) < self::OTP_RESEND_COOLDOWN_SECONDS) {
                return;
            }
        }

        $otp = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);

        $user->email_otp_hash = Hash::make($otp);
        $user->email_otp_expires_at = $now->addMinutes(self::OTP_EXPIRES_MINUTES);
        $user->otp_last_sent_at = $now;
        $user->save();

        $appName = (string) config('app.name', 'Renewal Portal');

        Mail::to($user->email)->send(new VerifyEmailOtpMail(
            otp: $otp,
            expiresMinutes: self::OTP_EXPIRES_MINUTES,
            appName: $appName,
        ));
    }
}
