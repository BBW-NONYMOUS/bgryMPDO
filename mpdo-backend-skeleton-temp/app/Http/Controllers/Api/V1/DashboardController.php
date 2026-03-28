<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ActivityLogResource;
use App\Http\Resources\V1\DocumentResource;
use App\Models\ActivityLog;
use App\Models\Barangay;
use App\Models\Category;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $visibleDocuments = Document::query()->visibleTo($user);

        $recentDocuments = (clone $visibleDocuments)
            ->with(['category', 'barangay', 'uploader'])
            ->limit(5)
            ->get();

        $recentActivityQuery = ActivityLog::query()
            ->with(['user.barangay', 'document.category', 'document.barangay'])
            ->orderByDesc('created_at');

        if (! $user->isAdmin()) {
            $recentActivityQuery->where(function ($query) use ($user, $visibleDocuments): void {
                $query
                    ->where('user_id', $user->id)
                    ->orWhereIn('document_id', (clone $visibleDocuments)->select('documents.id'));
            });
        }

        $recentActivity = $recentActivityQuery->limit(5)->get();

        return response()->json([
            'counts' => [
                'documents' => (clone $visibleDocuments)->count(),
                'users' => $user->isAdmin() ? User::count() : null,
                'categories' => Category::count(),
                'barangays' => Barangay::count(),
            ],
            'recent_documents' => DocumentResource::collection($recentDocuments)->resolve(),
            'recent_activity' => ActivityLogResource::collection($recentActivity)->resolve(),
        ]);
    }
}
