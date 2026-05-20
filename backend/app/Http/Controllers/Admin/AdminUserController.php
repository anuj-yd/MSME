<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    private const ADMIN_EMAIL = 'anushkasurya803@gmail.com';

    public function index(Request $request)
    {
        // Simple list of all users, sorted by latest
        $users = User::query()->orderByDesc('created_at')->get()->map(function ($u) {
            return [
                'id' => (string) $u->getKey(),
                'name' => $u->name,
                'email' => $u->email,
                'role' => mb_strtolower((string) $u->email) === self::ADMIN_EMAIL ? 'admin' : 'user',
                'created_at' => $u->created_at,
            ];
        })->values();

        return response()->json(['users' => $users]);
    }

    public function updateRole(Request $request, string $id)
    {
        $data = $request->validate([
            'role' => ['required', 'string', 'in:user,admin'],
        ]);

        $user = User::query()->where('_id', $id)->first();
        if (! $user) return response()->json(['message' => 'Not found.'], 404);

        if (mb_strtolower((string) $user->email) === self::ADMIN_EMAIL) {
            return response()->json(['message' => 'Primary admin role is fixed for this account.'], 422);
        }

        if ($data['role'] === 'admin') {
            return response()->json(['message' => 'Only anushkasurya803@gmail.com can be admin.'], 422);
        }

        $user->role = 'user';
        $user->save();

        return response()->json(['user' => [
            'id' => (string) $user->getKey(),
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'created_at' => $user->created_at,
        ]]);
    }
}
