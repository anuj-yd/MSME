<?php

namespace App\Http\Controllers;

use App\Models\Entitlement;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class BillingController extends Controller
{
    public function entitlement(Request $request)
    {
        $user = $request->user();
        $ent = Entitlement::query()->where('user_id', (string) $user->getKey())->first();

        $active = (bool) ($ent?->is_premium);
        if ($active && $ent?->premium_until && $ent->premium_until->isPast()) {
            $active = false;
        }

        return response()->json([
            'entitlement' => [
                'is_premium' => $active,
                'premium_until' => $ent?->premium_until,
            ],
        ]);
    }

    public function createOrder(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'purpose' => ['required', 'string', 'in:premium_monthly,premium_yearly'],
        ]);

        $keyId = (string) config('services.razorpay.key_id');
        $keySecret = (string) config('services.razorpay.key_secret');

        if ($keyId === '' || $keySecret === '') {
            throw ValidationException::withMessages([
                'razorpay' => ['Razorpay keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'],
            ]);
        }

        $amountInr = $data['purpose'] === 'premium_yearly' ? 999 : 99;
        $amountPaise = $amountInr * 100;

        $auth = base64_encode($keyId.':'.$keySecret);

        $resp = Http::withHeaders([
            'Authorization' => 'Basic '.$auth,
        ])->post('https://api.razorpay.com/v1/orders', [
            'amount' => $amountPaise,
            'currency' => 'INR',
            'receipt' => 'msme_'.$user->getKey().'_'.time(),
            'notes' => [
                'purpose' => $data['purpose'],
                'user_id' => (string) $user->getKey(),
            ],
        ]);

        if (! $resp->successful()) {
            return response()->json([
                'message' => 'Failed to create Razorpay order.',
                'details' => $resp->json(),
            ], 502);
        }

        $order = (array) $resp->json();

        Payment::query()->create([
            'user_id' => (string) $user->getKey(),
            'provider' => 'razorpay',
            'purpose' => $data['purpose'],
            'amount_inr' => $amountInr,
            'currency' => 'INR',
            'status' => 'created',
            'razorpay_order_id' => $order['id'] ?? null,
            'raw' => $order,
        ]);

        return response()->json([
            'key_id' => $keyId,
            'order' => $order,
        ]);
    }

    public function verifyPayment(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'razorpay_order_id' => ['required', 'string'],
            'razorpay_payment_id' => ['required', 'string'],
            'razorpay_signature' => ['required', 'string'],
        ]);

        $keySecret = (string) config('services.razorpay.key_secret');
        if ($keySecret === '') {
            return response()->json(['message' => 'Razorpay not configured.'], 500);
        }

        $payload = $data['razorpay_order_id'].'|'.$data['razorpay_payment_id'];
        $expected = hash_hmac('sha256', $payload, $keySecret);

        if (! hash_equals($expected, $data['razorpay_signature'])) {
            return response()->json(['message' => 'Invalid signature.'], 400);
        }

        $payment = Payment::query()
            ->where('user_id', (string) $user->getKey())
            ->where('razorpay_order_id', $data['razorpay_order_id'])
            ->first();

        if (! $payment) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        $payment->razorpay_payment_id = $data['razorpay_payment_id'];
        $payment->razorpay_signature = $data['razorpay_signature'];
        $payment->status = 'paid';
        $payment->save();

        $months = $payment->purpose === 'premium_yearly' ? 12 : 1;

        $ent = Entitlement::query()->firstOrNew(['user_id' => (string) $user->getKey()]);
        $ent->is_premium = true;
        $ent->premium_until = now()->addMonths($months);
        $ent->save();

        return response()->json([
            'message' => 'Payment verified. Premium unlocked.',
            'entitlement' => [
                'is_premium' => true,
                'premium_until' => $ent->premium_until,
            ],
        ]);
    }
}

