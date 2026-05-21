<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\RenewalApplication;
use App\Models\Entitlement;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
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

    public function stats(Request $request)
    {
        $totalUsers = User::query()->count();
        $premiumUsers = Entitlement::query()->count();
        $totalApplications = RenewalApplication::query()->whereIn('status', self::ADMIN_VISIBLE_STATUSES)->count();

        // Count by status
        $applicationsByStatus = [
            'submitted' => RenewalApplication::query()->where('status', 'submitted')->count(),
            'payment_verified' => RenewalApplication::query()->where('status', 'payment_verified')->count(),
            'in_review' => RenewalApplication::query()->where('status', 'in_review')->count(),
            'approved' => RenewalApplication::query()->where('status', 'approved')->count(),
            'filed' => RenewalApplication::query()->where('status', 'filed')->count(),
            'completed' => RenewalApplication::query()->where('status', 'completed')->count(),
            'rejected' => RenewalApplication::query()->where('status', 'rejected')->count(),
        ];

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'premium_users' => $premiumUsers,
                'total_applications' => $totalApplications,
                'applications_by_status' => $applicationsByStatus,
            ]
        ]);
    }
}
