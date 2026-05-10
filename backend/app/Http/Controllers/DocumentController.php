<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Services\ImageKitService;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $docs = Document::query()
            ->where('user_id', (string) $user->getKey())
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->values();

        return response()->json(['documents' => $docs]);
    }

    public function store(Request $request, ImageKitService $imageKit)
    {
        $user = $request->user();

        $data = $request->validate([
            'file' => ['required', 'file', 'max:10240', 'mimes:pdf,png,jpg,jpeg'],
            'tags' => ['sometimes', 'array', 'max:10'],
            'tags.*' => ['string', 'max:24'],
        ]);

        /** @var \Illuminate\Http\UploadedFile $file */
        $file = $data['file'];
        $tags = (array) ($data['tags'] ?? []);

        $safeBase = preg_replace('/[^a-zA-Z0-9._-]+/', '-', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $ext = $file->getClientOriginalExtension();
        $fileName = trim($safeBase ?: 'document').'.'.($ext ?: 'bin');

        $uploaded = $imageKit->uploadDocument(
            file: $file,
            fileName: $fileName,
            tags: array_values($tags),
        );

        $doc = Document::query()->create([
            'user_id' => (string) $user->getKey(),
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'size_bytes' => $file->getSize(),
            'imagekit_file_id' => $uploaded['fileId'] ?? null,
            'imagekit_url' => $uploaded['url'] ?? null,
            'imagekit_thumbnail_url' => $uploaded['thumbnailUrl'] ?? null,
            'tags' => array_values($tags),
        ]);

        return response()->json(['document' => $doc], 201);
    }

    public function update(Request $request, string $id)
    {
        $user = $request->user();

        $doc = Document::query()
            ->where('_id', $id)
            ->where('user_id', (string) $user->getKey())
            ->first();

        if (! $doc) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $data = $request->validate([
            'tags' => ['required', 'array', 'max:10'],
            'tags.*' => ['string', 'max:24'],
        ]);

        $doc->tags = array_values($data['tags']);
        $doc->save();

        return response()->json(['document' => $doc]);
    }

    public function destroy(Request $request, string $id)
    {
        $user = $request->user();

        $doc = Document::query()
            ->where('_id', $id)
            ->where('user_id', (string) $user->getKey())
            ->first();

        if (! $doc) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $doc->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
