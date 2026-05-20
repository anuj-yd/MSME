<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\RenewalApplication;
use App\Models\RenewalType;
use App\Models\User;
use Illuminate\Http\Request;

class AdminRenewalController extends Controller
{
    public function index(Request $request)
    {
        $status = (string) $request->query('status', 'submitted');

        $q = RenewalApplication::query();
        if ($status !== 'all') {
            $q->where('status', $status);
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
            'status' => ['required', 'string', 'in:submitted,in_review,approved,otp_required,filed,completed,rejected'],
            'note' => ['sometimes', 'string', 'max:500'],
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

        return response()->json(['renewal' => $app]);
    }
}
