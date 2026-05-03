<?php

use App\Http\Controllers\Api\V1\ActivityLogController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BarangayController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\DataManagementController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DocumentController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\SystemSettingController;
use App\Http\Controllers\Api\V1\UserController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'active.account'])->group(function (): void {
        Route::get('profile', [AuthController::class, 'profile']);
        Route::put('profile', [ProfileController::class, 'update']);
        Route::put('profile/password', [ProfileController::class, 'updatePassword']);
        Route::post('profile/photo', [ProfileController::class, 'updatePhoto']);
    });

    Route::middleware('auth:sanctum')->post('logout', [AuthController::class, 'logout']);
});

Route::middleware(['auth:sanctum', 'active.account'])->group(function (): void {
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('reports/dashboard-summary', [ReportController::class, 'dashboardSummary']);
    Route::get('reports/documents', [ReportController::class, 'documents']);
    Route::get('reports/activity-logs', [ReportController::class, 'activityLogs'])->middleware('role:'.User::ROLE_ADMIN);

    Route::get('categories', [CategoryController::class, 'index']);
    Route::post('categories', [CategoryController::class, 'store'])->middleware('role:'.User::ROLE_ADMIN);
    Route::put('categories/{category}', [CategoryController::class, 'update'])->middleware('role:'.User::ROLE_ADMIN);
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->middleware('role:'.User::ROLE_ADMIN);

    Route::get('barangays', [BarangayController::class, 'index']);
    Route::post('barangays', [BarangayController::class, 'store'])->middleware('role:'.User::ROLE_ADMIN);
    Route::put('barangays/{barangay}', [BarangayController::class, 'update'])->middleware('role:'.User::ROLE_ADMIN);
    Route::delete('barangays/{barangay}', [BarangayController::class, 'destroy'])->middleware('role:'.User::ROLE_ADMIN);

    Route::get('documents', [DocumentController::class, 'index']);
    Route::post('documents', [DocumentController::class, 'store'])->middleware('role:'.User::ROLE_ADMIN.','.User::ROLE_STAFF);
    Route::get('documents/{document}/preview', [DocumentController::class, 'preview']);
    Route::get('documents/{document}', [DocumentController::class, 'show']);
    Route::put('documents/{document}', [DocumentController::class, 'update'])->middleware('role:'.User::ROLE_ADMIN.','.User::ROLE_STAFF);
    Route::patch('documents/{document}/status', [DocumentController::class, 'patchStatus'])->middleware('role:'.User::ROLE_ADMIN.','.User::ROLE_STAFF);
    Route::delete('documents/{document}', [DocumentController::class, 'destroy'])->middleware('role:'.User::ROLE_ADMIN.','.User::ROLE_STAFF);
    Route::get('documents/{document}/download', [DocumentController::class, 'download']);

    Route::get('users', [UserController::class, 'index'])->middleware('role:'.User::ROLE_ADMIN);
    Route::post('users', [UserController::class, 'store'])->middleware('role:'.User::ROLE_ADMIN);
    Route::get('users/{user}', [UserController::class, 'show'])->middleware('role:'.User::ROLE_ADMIN);
    Route::put('users/{user}', [UserController::class, 'update'])->middleware('role:'.User::ROLE_ADMIN);
    Route::post('users/{user}/approve', [UserController::class, 'approve'])->middleware('role:'.User::ROLE_ADMIN);
    Route::post('users/{user}/reject', [UserController::class, 'reject'])->middleware('role:'.User::ROLE_ADMIN);
    Route::post('users/{user}/suspend', [UserController::class, 'suspend'])->middleware('role:'.User::ROLE_ADMIN);
    Route::post('users/{user}/unsuspend', [UserController::class, 'unsuspend'])->middleware('role:'.User::ROLE_ADMIN);
    Route::delete('users/{user}', [UserController::class, 'destroy'])->middleware('role:'.User::ROLE_ADMIN);

    Route::get('activity-logs', [ActivityLogController::class, 'index'])->middleware('role:'.User::ROLE_ADMIN);

    Route::get('settings', [SystemSettingController::class, 'index']);
    Route::put('settings/{key}', [SystemSettingController::class, 'update'])->middleware('role:'.User::ROLE_ADMIN);

    Route::middleware('role:'.User::ROLE_ADMIN)->prefix('data-management')->group(function (): void {
        Route::post('seed', [DataManagementController::class, 'seed']);
        Route::get('backup', [DataManagementController::class, 'backup']);
        Route::post('restore', [DataManagementController::class, 'restore']);
        Route::post('reset', [DataManagementController::class, 'reset']);
    });
});
