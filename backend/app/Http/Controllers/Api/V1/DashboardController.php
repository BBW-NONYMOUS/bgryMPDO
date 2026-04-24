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
            ->orderByDesc('created_at')
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

        $statusCounts = (clone $visibleDocuments)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $topCategories = (clone $visibleDocuments)
            ->join('categories', 'documents.category_id', '=', 'categories.id')
            ->selectRaw('categories.name, count(documents.id) as total')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total')
            ->limit(6)
            ->get()
            ->map(fn ($item) => ['name' => $item->name, 'count' => (int) $item->total]);

        return response()->json([
            'counts' => [
                'documents' => (clone $visibleDocuments)->count(),
                'users' => $user->isAdmin() ? User::count() : null,
                'categories' => Category::count(),
                'barangays' => Barangay::count(),
            ],
            'status_counts' => $statusCounts,
            'top_categories' => $topCategories,
            'recent_documents' => DocumentResource::collection($recentDocuments)->resolve(),
            'recent_activity' => ActivityLogResource::collection($recentActivity)->resolve(),
        ]);
    }
}
