<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\RenewalApplication;
use App\Models\RenewalType;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RenewalController extends Controller
{
    public function types()
    {
        $types = RenewalType::query()
            ->where('active', true)
            ->orderBy('name')
            ->get()
            ->values();

        if ($types->isEmpty()) {
            $this->seedDefaultTypes();
            $types = RenewalType::query()
                ->where('active', true)
                ->orderBy('name')
                ->get()
                ->values();
        }

        return response()->json(['types' => $types]);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $apps = RenewalApplication::query()
            ->where('user_id', (string) $user->getKey())
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->values();

        return response()->json(['renewals' => $apps]);
    }

    public function create(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'renewal_type_code' => ['required', 'string', 'max:64'],
        ]);

        $type = RenewalType::query()->where('code', $data['renewal_type_code'])->where('active', true)->first();
        if (! $type) {
            throw ValidationException::withMessages([
                'renewal_type_code' => ['Invalid renewal type.'],
            ]);
        }

        $app = RenewalApplication::query()->create([
            'user_id' => (string) $user->getKey(),
            'renewal_type_code' => $type->code,
            'status' => 'draft',
            'fields' => [],
            'document_ids' => [],
            'submitted_at' => null,
        ]);

        return response()->json(['renewal' => $app], 201);
    }

    public function show(Request $request, string $id)
    {
        $user = $request->user();

        $app = RenewalApplication::query()
            ->where('_id', $id)
            ->where('user_id', (string) $user->getKey())
            ->first();

        if (! $app) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $type = RenewalType::query()->where('code', $app->renewal_type_code)->first();

        return response()->json([
            'renewal' => $app,
            'type' => $type,
        ]);
    }

    public function updateDraft(Request $request, string $id)
    {
        $user = $request->user();

        $app = RenewalApplication::query()
            ->where('_id', $id)
            ->where('user_id', (string) $user->getKey())
            ->first();

        if (! $app) return response()->json(['message' => 'Not found.'], 404);
        if ($app->status !== 'draft') return response()->json(['message' => 'Only draft can be updated.'], 409);

        $data = $request->validate([
            'fields' => ['sometimes', 'array'],
            'document_ids' => ['sometimes', 'array'],
            'document_ids.*' => ['string'],
        ]);

        if (array_key_exists('fields', $data)) $app->fields = $data['fields'];
        if (array_key_exists('document_ids', $data)) $app->document_ids = array_values($data['document_ids']);
        $app->save();

        return response()->json(['renewal' => $app]);
    }

    public function submit(Request $request, string $id)
    {
        $user = $request->user();

        $app = RenewalApplication::query()
            ->where('_id', $id)
            ->where('user_id', (string) $user->getKey())
            ->first();

        if (! $app) return response()->json(['message' => 'Not found.'], 404);
        if ($app->status !== 'draft') return response()->json(['message' => 'Only draft can be submitted.'], 409);

        $type = RenewalType::query()->where('code', $app->renewal_type_code)->where('active', true)->first();
        if (! $type) return response()->json(['message' => 'Renewal type not available.'], 409);

        $required = (array) ($type->required_document_tags ?? []);
        if ($required) {
            $docs = Document::query()
                ->where('user_id', (string) $user->getKey())
                ->whereIn('_id', (array) $app->document_ids)
                ->get();

            $docTags = [];
            foreach ($docs as $d) {
                foreach ((array) ($d->tags ?? []) as $t) $docTags[$t] = true;
            }

            $missing = array_values(array_filter($required, fn ($t) => empty($docTags[$t])));
            if ($missing) {
                throw ValidationException::withMessages([
                    'documents' => ['Missing required documents: '.implode(', ', $missing)],
                ]);
            }
        }

        $app->status = 'submitted';
        $app->submitted_at = now();
        $app->save();

        return response()->json(['renewal' => $app]);
    }

    private function seedDefaultTypes(): void
    {
        $defaults = [
            [
                'code' => 'trade_license',
                'name' => 'Trade License Renewal',
                'description' => 'Renew your trade license with required documents and details.',
                'required_document_tags' => ['identity', 'address', 'license_copy'],
                'fields_schema' => [
                    [
                        'key' => 'business_name',
                        'label' => 'Business name',
                        'type' => 'text',
                        'required' => true,
                        'max' => 120,
                    ],
                    [
                        'key' => 'registration_no',
                        'label' => 'Registration number',
                        'type' => 'text',
                        'required' => true,
                        'max' => 60,
                    ],
                ],
                'active' => true,
            ],
            [
                'code' => 'udyam_update',
                'name' => 'Udyam Update',
                'description' => 'Update Udyam profile and submit supporting documents.',
                'required_document_tags' => ['identity', 'udyam_certificate'],
                'fields_schema' => [
                    [
                        'key' => 'udyam_no',
                        'label' => 'Udyam registration number',
                        'type' => 'text',
                        'required' => true,
                        'max' => 40,
                    ],
                    [
                        'key' => 'business_name',
                        'label' => 'Business name',
                        'type' => 'text',
                        'required' => true,
                        'max' => 120,
                    ],
                ],
                'active' => true,
            ],
            [
                'code' => 'shop_establishment',
                'name' => 'Shop & Establishment Renewal',
                'description' => 'Renew shop & establishment registration with checklist.',
                'required_document_tags' => ['identity', 'address', 'registration_copy'],
                'fields_schema' => [
                    [
                        'key' => 'business_name',
                        'label' => 'Business name',
                        'type' => 'text',
                        'required' => true,
                        'max' => 120,
                    ],
                    [
                        'key' => 'registration_no',
                        'label' => 'Registration number',
                        'type' => 'text',
                        'required' => true,
                        'max' => 60,
                    ],
                    [
                        'key' => 'address',
                        'label' => 'Business address',
                        'type' => 'textarea',
                        'required' => true,
                        'max' => 300,
                    ],
                ],
                'active' => true,
            ],
        ];

        foreach ($defaults as $d) {
            RenewalType::query()->updateOrCreate(
                ['code' => $d['code']],
                $d
            );
        }
    }
}
