<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

class ImageKitService
{
    public function uploadDocument(UploadedFile $file, string $fileName, array $tags = []): array
    {
        $privateKey = (string) config('services.imagekit.private_key');
        $folder = (string) config('services.imagekit.folder', '/msme');

        if ($privateKey === '') {
            throw new \RuntimeException('IMAGEKIT_PRIVATE_KEY is not configured.');
        }

        $endpoint = 'https://upload.imagekit.io/api/v1/files/upload';
        $auth = base64_encode($privateKey.':');

        $response = Http::asMultipart()
            ->withHeaders([
                'Authorization' => 'Basic '.$auth,
            ])
            ->attach(
                name: 'file',
                contents: fopen($file->getRealPath(), 'r'),
                filename: $fileName
            )
            ->post($endpoint, [
                'fileName' => $fileName,
                'folder' => $folder,
                'useUniqueFileName' => 'true',
                'tags' => $tags ? implode(',', $tags) : null,
            ]);

        try {
            $response->throw();
        } catch (RequestException $e) {
            throw new \RuntimeException('ImageKit upload failed: '.$e->getMessage(), previous: $e);
        }

        return (array) $response->json();
    }
}

