<?php

namespace App\Http\Middleware;

use Carbon\CarbonImmutable;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureDocumentVaultUnlocked
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $unlockedUntil = $user?->document_vault_unlocked_until;

        if (! $user || ! $unlockedUntil || CarbonImmutable::parse($unlockedUntil)->isPast()) {
            return response()->json([
                'message' => 'Document vault is locked. Please verify OTP to continue.',
                'code' => 'document_vault_locked',
            ], 423);
        }

        return $next($request);
    }
}
