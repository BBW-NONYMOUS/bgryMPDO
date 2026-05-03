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
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        $visibleDocumentIds = (clone $visibleDocuments)->pluck('documents.id');

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

        $categoryDistribution = (clone $visibleDocuments)
            ->join('categories', 'documents.category_id', '=', 'categories.id')
            ->selectRaw('categories.name, count(documents.id) as total')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('total')
            ->limit(6)
            ->get();

        $categoryTotal = max(1, (int) $categoryDistribution->sum('total'));
        $categoryDistribution = $categoryDistribution
            ->map(fn ($item) => [
                'name' => $item->name,
                'count' => (int) $item->total,
                'percentage' => round(((int) $item->total / $categoryTotal) * 100, 1),
            ]);

        $trendStart = CarbonImmutable::now()->startOfMonth()->subMonths(5);
        $monthlyRows = (clone $visibleDocuments)
            ->where('created_at', '>=', $trendStart)
            ->get(['created_at'])
            ->groupBy(fn (Document $document) => $document->created_at?->format('Y-m'));

        $monthlyDocuments = collect(range(0, 5))
            ->map(function (int $offset) use ($trendStart, $monthlyRows): array {
                $month = $trendStart->addMonths($offset);
                $key = $month->format('Y-m');

                return [
                    'key' => $key,
                    'label' => $month->format('M Y'),
                    'count' => (int) ($monthlyRows->get($key)?->count() ?? 0),
                ];
            });

        $now = CarbonImmutable::now();
        $currentMonthStart = $now->startOfMonth();
        $previousMonthStart = $currentMonthStart->subMonth();

        $documentsThisMonth = (clone $visibleDocuments)->where('created_at', '>=', $currentMonthStart)->count();
        $documentsPreviousMonth = (clone $visibleDocuments)
            ->whereBetween('created_at', [$previousMonthStart, $currentMonthStart])
            ->count();

        $activityBaseQuery = ActivityLog::query();

        if (! $user->isAdmin()) {
            $activityBaseQuery->where(function ($query) use ($user, $visibleDocumentIds): void {
                $query
                    ->where('user_id', $user->id)
                    ->orWhereIn('document_id', $visibleDocumentIds);
            });
        }

        $activityThisMonth = (clone $activityBaseQuery)->where('created_at', '>=', $currentMonthStart)->count();
        $activityPreviousMonth = (clone $activityBaseQuery)
            ->whereBetween('created_at', [$previousMonthStart, $currentMonthStart])
            ->count();

        $usedStorageBytes = (int) (clone $visibleDocuments)->sum('file_size');
        $storageCapacityBytes = 25 * 1024 * 1024 * 1024;

        $roleCounts = $user->isAdmin()
            ? User::query()
                ->select('role', DB::raw('count(*) as total'))
                ->groupBy('role')
                ->pluck('total', 'role')
                ->mapWithKeys(fn ($count, $role) => [User::roleForApi($role) => (int) $count])
            : null;

        return response()->json([
            'counts' => [
                'documents' => (clone $visibleDocuments)->count(),
                'users' => $user->isAdmin() ? User::count() : null,
                'categories' => Category::count(),
                'barangays' => Barangay::count(),
                'activity_logs' => (clone $activityBaseQuery)->count(),
            ],
            'deltas' => [
                'documents' => $this->percentageChange($documentsThisMonth, $documentsPreviousMonth),
                'activity_logs' => $this->percentageChange($activityThisMonth, $activityPreviousMonth),
            ],
            'status_counts' => $statusCounts,
            'top_categories' => $topCategories,
            'category_distribution' => $categoryDistribution,
            'monthly_documents' => $monthlyDocuments,
            'storage' => [
                'used_bytes' => $usedStorageBytes,
                'capacity_bytes' => $storageCapacityBytes,
                'used_percentage' => round(($usedStorageBytes / $storageCapacityBytes) * 100, 1),
            ],
            'user_role_counts' => $roleCounts,
            'recent_documents' => DocumentResource::collection($recentDocuments)->resolve(),
            'recent_activity' => ActivityLogResource::collection($recentActivity)->resolve(),
        ]);
    }

    private function percentageChange(int $current, int $previous): float
    {
        if ($previous === 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
