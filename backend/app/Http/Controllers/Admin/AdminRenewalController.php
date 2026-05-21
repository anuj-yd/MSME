<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Payment;
use App\Models\RenewalApplication;
use App\Models\RenewalType;
use App\Models\User;
use App\Mail\ApprovalMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;

class AdminRenewalController extends Controller
{
    private const ADMIN_VISIBLE_STATUSES = [
        'submitted',
        'payment_verified',
        'in_review',
        'approved',
        'filed',
        'completed',
        'rejected',
    ];

    public function index(Request $request)
    {
        $status = (string) $request->query('status', 'submitted');

        $q = RenewalApplication::query()->whereIn('status', self::ADMIN_VISIBLE_STATUSES);
        if ($status !== 'all' && in_array($status, self::ADMIN_VISIBLE_STATUSES, true)) {
            $q->where('status', $status);
        } elseif ($status !== 'all') {
            $q->where('_id', '__invalid_admin_status__');
        }

        $apps = $q->orderByDesc('created_at')->limit(100)->get()->values();

        $userIds = $apps->pluck('user_id')->unique()->values();
        $users = User::query()->whereIn('_id', $userIds)->get()->keyBy(fn ($u) => (string) $u->getKey());

        $types = RenewalType::query()->get()->keyBy('code');

        $mapped = $apps->map(function ($a) use ($users, $types) {
            $user = $users[(string) $a->user_id] ?? null;
            $type = $types[(string) $a->renewal_type_code] ?? null;

            return [
                'id' => (string) $a->getKey(),
                'status' => (string) ($a->status ?? ''),
                'renewal_type_code' => (string) ($a->renewal_type_code ?? ''),
                'renewal_type_name' => (string) ($type?->name ?? $a->renewal_type_code ?? ''),
                'submitted_at' => $a->submitted_at,
                'updated_at' => $a->updated_at,
                'user' => $user ? [
                    'id' => (string) $user->getKey(),
                    'name' => $user->name,
                    'email' => $user->email,
                ] : null,
            ];
        })->values();

        return response()->json(['renewals' => $mapped]);
    }

    public function show(Request $request, string $id)
    {
        $app = RenewalApplication::query()->where('_id', $id)->first();
        if (! $app) return response()->json(['message' => 'Not found.'], 404);
        if (! in_array((string) ($app->status ?? ''), self::ADMIN_VISIBLE_STATUSES, true)) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $user = User::query()->where('_id', (string) $app->user_id)->first();
        $type = RenewalType::query()->where('code', (string) $app->renewal_type_code)->first();

        $docs = Document::query()
            ->where('user_id', (string) $app->user_id)
            ->whereIn('_id', (array) ($app->document_ids ?? []))
            ->get()
            ->values();

        return response()->json([
            'renewal' => $app,
            'user' => $user,
            'type' => $type,
            'documents' => $docs,
        ]);
    }

    public function setStatus(Request $request, string $id)
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:submitted,payment_verified,in_review,approved,filed,completed,rejected'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $app = RenewalApplication::query()->where('_id', $id)->first();
        if (! $app) return response()->json(['message' => 'Not found.'], 404);

        $app->status = $data['status'];
        if (!empty($data['note'])) {
            $notes = (array) ($app->fields['admin_notes'] ?? []);
            $notes[] = [
                'at' => now()->toISOString(),
                'note' => $data['note'],
            ];
            $fields = (array) ($app->fields ?? []);
            $fields['admin_notes'] = $notes;
            $app->fields = $fields;
        }
        $app->save();

        // Send approval email when application is approved or marked completed
        if (in_array($data['status'], ['approved', 'completed'])) {
            try {
                $user = User::query()->where('_id', (string) $app->user_id)->first();
                if ($user && !empty($user->email)) {
                    Mail::to($user->email)->send(new ApprovalMail($user->name ?? 'Applicant', $app->fields['tracking_id'] ?? (string) $app->getKey(), config('app.name')));
                }
            } catch (\Throwable $e) {
                // Do not break the API if mail fails; log silently
                report($e);
            }
        }

        return response()->json(['renewal' => $app]);
    }

    public function payments(Request $request)
    {
        $payments = Payment::query()
            ->orderByDesc('created_at')
            ->limit(100)
            ->get()
            ->values();

        $userIds = $payments->pluck('user_id')->unique()->values();
        $users = User::query()->whereIn('_id', $userIds)->get()->keyBy(fn ($u) => (string) $u->getKey());

        $renewalIds = $payments->pluck('renewal_id')->filter()->unique()->values();
        $renewals = RenewalApplication::query()->whereIn('_id', $renewalIds)->get()->keyBy(fn ($r) => (string) $r->getKey());

        $mapped = $payments->map(function ($payment) use ($users, $renewals) {
            $user = $users[(string) $payment->user_id] ?? null;
            $renewal = $payment->renewal_id ? ($renewals[(string) $payment->renewal_id] ?? null) : null;
            $fields = (array) ($renewal?->fields ?? []);

            return [
                'id' => (string) $payment->getKey(),
                'user_id' => (string) ($payment->user_id ?? ''),
                'purpose' => (string) ($payment->purpose ?? ''),
                'renewal_id' => $payment->renewal_id ? (string) $payment->renewal_id : null,
                'amount_inr' => $payment->amount_inr,
                'currency' => (string) ($payment->currency ?? 'INR'),
                'status' => (string) ($payment->status ?? ''),
                'provider' => (string) ($payment->provider ?? ''),
                'razorpay_order_id' => $payment->razorpay_order_id,
                'razorpay_payment_id' => $payment->razorpay_payment_id,
                'created_at' => $payment->created_at,
                'updated_at' => $payment->updated_at,
                'user' => $user ? [
                    'id' => (string) $user->getKey(),
                    'name' => $user->name,
                    'email' => $user->email,
                ] : null,
                'renewal' => $renewal ? [
                    'id' => (string) $renewal->getKey(),
                    'status' => (string) ($renewal->status ?? ''),
                    'tracking_id' => $fields['tracking_id'] ?? null,
                    'renewal_type_code' => (string) ($renewal->renewal_type_code ?? ''),
                    'payment_status' => $fields['payment_details']['paymentStatus'] ?? null,
                ] : null,
            ];
        })->values();

        return response()->json(['payments' => $mapped]);
    }

    public function verifyPayment(Request $request, string $id)
    {
        $app = RenewalApplication::query()->where('_id', $id)->first();
        if (! $app) return response()->json(['message' => 'Not found.'], 404);

        $fields = (array) ($app->fields ?? []);
        $paymentDetails = (array) ($fields['payment_details'] ?? []);
        $paymentDetails['mode'] = $paymentDetails['mode'] ?? 'Razorpay';
        $paymentDetails['paymentStatus'] = 'Verified';
        $paymentDetails['verifiedAt'] = now()->toISOString();
        $fields['payment_details'] = $paymentDetails;

        $app->fields = $fields;
        $app->status = 'payment_verified';
        $app->save();

        Payment::query()
            ->where('renewal_id', (string) $app->getKey())
            ->where('status', 'paid')
            ->update(['status' => 'verified']);

        return response()->json(['renewal' => $app]);
    }
}
