<?php

namespace App\Http\Controllers;

use App\Models\OtpApproval;
use App\Models\RenewalApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Validation\ValidationException;

class OtpApprovalController extends Controller
{
    public function requestOtp(Request $request, string $renewalId)
    {
        $admin = $request->user();

        $renewal = RenewalApplication::query()->where('_id', $renewalId)->first();
        if (! $renewal) return response()->json(['message' => 'Not found.'], 404);

        $approval = OtpApproval::query()->create([
            'renewal_id' => (string) $renewal->getKey(),
            'user_id' => (string) $renewal->user_id,
            'requested_by_admin_id' => (string) $admin->getKey(),
            'status' => 'requested',
            'expires_at' => now()->addMinutes(5),
            'otp_ciphertext' => null,
            'viewed_at' => null,
            'note' => (string) $request->input('note', ''),
        ]);

        $renewal->status = 'otp_required';
        $renewal->save();

        return response()->json(['otp_request' => $approval], 201);
    }

    public function submitOtp(Request $request, string $renewalId)
    {
        $user = $request->user();

        $renewal = RenewalApplication::query()
            ->where('_id', $renewalId)
            ->where('user_id', (string) $user->getKey())
            ->first();

        if (! $renewal) return response()->json(['message' => 'Not found.'], 404);

        $data = $request->validate([
            'otp' => ['required', 'string', 'min:4', 'max:8'],
        ]);

        $approval = OtpApproval::query()
            ->where('renewal_id', (string) $renewal->getKey())
            ->where('user_id', (string) $user->getKey())
            ->where('status', 'requested')
            ->orderByDesc('created_at')
            ->first();

        if (! $approval) {
            return response()->json(['message' => 'No OTP request pending.'], 409);
        }

        if ($approval->expires_at && $approval->expires_at->isPast()) {
            $approval->status = 'expired';
            $approval->save();
            throw ValidationException::withMessages(['otp' => ['OTP request expired. Ask admin to request again.']]);
        }

        $approval->otp_ciphertext = Crypt::encryptString((string) $data['otp']);
        $approval->status = 'provided';
        $approval->save();

        return response()->json(['message' => 'OTP submitted securely. Admin can proceed.']);
    }

    public function adminGetOtp(Request $request, string $renewalId)
    {
        $admin = $request->user();

        $approval = OtpApproval::query()
            ->where('renewal_id', $renewalId)
            ->where('requested_by_admin_id', (string) $admin->getKey())
            ->orderByDesc('created_at')
            ->first();

        if (! $approval) return response()->json(['message' => 'Not found.'], 404);

        if ($approval->expires_at && $approval->expires_at->isPast()) {
            $approval->status = 'expired';
            $approval->save();
            return response()->json(['message' => 'OTP request expired.'], 410);
        }

        if ($approval->status !== 'provided') {
            return response()->json(['status' => $approval->status]);
        }

        if ($approval->viewed_at) {
            return response()->json(['status' => 'viewed']);
        }

        $otp = Crypt::decryptString((string) $approval->otp_ciphertext);
        $approval->viewed_at = now();
        $approval->save();

        return response()->json([
            'status' => 'provided',
            'otp' => $otp,
            'viewed_at' => $approval->viewed_at,
        ]);
    }
}

