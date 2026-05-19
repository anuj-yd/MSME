<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        // Simple list of all users, sorted by latest
        $users = User::query()->orderByDesc('created_at')->get()->map(function ($u) {
            return [
                'id' => (string) $u->getKey(),
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role ?? 'user',
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

        $user->role = $data['role'];
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
