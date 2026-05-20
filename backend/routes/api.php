<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DocumentVaultAccessController;
use App\Http\Controllers\RenewalController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\ReportController;
use App\Http\Middleware\ApiTokenAuth;
use App\Http\Middleware\EnsureDocumentVaultUnlocked;
use App\Http\Middleware\EnsureAdmin;
use App\Http\Controllers\Admin\AdminRenewalController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\OtpApprovalController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
Route::get('/ping', fn () => ['ok' => true]);

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::middleware(ApiTokenAuth::class)->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware(ApiTokenAuth::class)->group(function () {
    Route::get('/document-vault/status', [DocumentVaultAccessController::class, 'status']);
    Route::post('/document-vault/request-otp', [DocumentVaultAccessController::class, 'requestOtp']);
    Route::post('/document-vault/verify', [DocumentVaultAccessController::class, 'verify']);

    Route::middleware(EnsureDocumentVaultUnlocked::class)->group(function () {
        Route::get('/documents', [DocumentController::class, 'index']);
        Route::post('/documents', [DocumentController::class, 'store']);
        Route::patch('/documents/{id}', [DocumentController::class, 'update']);
        Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);
    });

    Route::get('/renewal-types', [RenewalController::class, 'types']);
    Route::get('/renewals', [RenewalController::class, 'index']);
    Route::post('/renewals', [RenewalController::class, 'create']);
    Route::get('/renewals/{id}', [RenewalController::class, 'show']);
    Route::patch('/renewals/{id}', [RenewalController::class, 'updateDraft']);
    Route::post('/renewals/{id}/submit', [RenewalController::class, 'submit']);

    Route::get('/billing/entitlement', [BillingController::class, 'entitlement']);
    Route::post('/billing/order', [BillingController::class, 'createOrder']);
    Route::post('/billing/verify', [BillingController::class, 'verifyPayment']);

    Route::get('/reports/renewal-summary.csv', [ReportController::class, 'renewalSummary']);
});

Route::prefix('admin')->middleware([ApiTokenAuth::class, EnsureAdmin::class])->group(function () {
    Route::get('/dashboard/stats', [AdminDashboardController::class, 'stats']);
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::patch('/users/{id}/role', [AdminUserController::class, 'updateRole']);

    Route::get('/renewals', [AdminRenewalController::class, 'index']);
    Route::get('/payments', [AdminRenewalController::class, 'payments']);
    Route::get('/renewals/{id}', [AdminRenewalController::class, 'show']);
    Route::post('/renewals/{id}/status', [AdminRenewalController::class, 'setStatus']);
    Route::post('/renewals/{id}/payment/verify', [AdminRenewalController::class, 'verifyPayment']);
    Route::post('/renewals/{id}/otp/request', [OtpApprovalController::class, 'requestOtp']);
    Route::get('/renewals/{id}/otp', [OtpApprovalController::class, 'adminGetOtp']);
});

Route::middleware(ApiTokenAuth::class)->group(function () {
    Route::post('/renewals/{id}/otp', [OtpApprovalController::class, 'submitOtp']);
});
