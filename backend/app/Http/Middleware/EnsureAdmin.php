<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    private const ADMIN_EMAIL = 'anushkasurya803@gmail.com';

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || mb_strtolower((string) $user->email) !== self::ADMIN_EMAIL) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return $next($request);
    }
}
