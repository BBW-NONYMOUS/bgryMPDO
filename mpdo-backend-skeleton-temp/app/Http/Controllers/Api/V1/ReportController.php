<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Barangay;
use App\Models\Category;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function documents(Request $request): StreamedResponse
    {
        /** @var User $user */
        $user = $request->user();

        $documents = Document::query()
            ->with(['category', 'barangay', 'uploader'])
            ->visibleTo($user)
            ->filter($request->only([
                'search',
                'category_id',
                'barangay_id',
                'uploaded_by',
                'status',
                'date_from',
                'date_to',
                'sort',
            ]))
            ->get();

        $rows = $documents->map(static fn (Document $document) => [
            $document->title,
            $document->document_number,
            $document->category?->name,
            $document->barangay?->name ?? 'All',
            $document->document_date?->toDateString(),
            $document->status,
            $document->access_level,
            $document->file_type,
            $document->uploader?->name,
            $document->created_at?->toDateTimeString(),
        ])->all();

        return $this->streamCsv(
            filename: 'documents-report.csv',
            headers: ['Title', 'Document Number', 'Category', 'Barangay', 'Document Date', 'Status', 'Access Level', 'File Type', 'Uploaded By', 'Uploaded At'],
            rows: $rows,
        );
    }

    public function activityLogs(Request $request): StreamedResponse
    {
        $validated = $request->validate([
            'action' => ['nullable', 'string'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ]);

        $logs = ActivityLog::query()
            ->with(['user.barangay', 'document.category', 'document.barangay'])
            ->filter($validated)
            ->get();

        $rows = $logs->map(static fn (ActivityLog $log) => [
            $log->created_at?->toDateTimeString(),
            $log->action,
            $log->module,
            $log->user?->name ?? 'System',
            $log->document?->title,
            $log->ip_address,
            $log->description,
        ])->all();

        return $this->streamCsv(
            filename: 'activity-logs-report.csv',
            headers: ['Date', 'Action', 'Module', 'User', 'Document', 'IP Address', 'Description'],
            rows: $rows,
        );
    }

    public function dashboardSummary(Request $request): StreamedResponse
    {
        /** @var User $user */
        $user = $request->user();

        $visibleDocuments = Document::query()->visibleTo($user);
        $recentDocuments = (clone $visibleDocuments)
            ->with(['category', 'barangay'])
            ->limit(5)
            ->get();

        $recentActivityQuery = ActivityLog::query()
            ->with(['user', 'document'])
            ->orderByDesc('created_at');

        if (! $user->isAdmin()) {
            $recentActivityQuery->where(function ($query) use ($user, $visibleDocuments): void {
                $query
                    ->where('user_id', $user->id)
                    ->orWhereIn('document_id', (clone $visibleDocuments)->select('documents.id'));
            });
        }

        $recentActivity = $recentActivityQuery->limit(5)->get();

        $rows = [
            ['Summary', 'Visible Documents', (string) (clone $visibleDocuments)->count()],
            ['Summary', 'Visible Categories', (string) Category::count()],
            ['Summary', 'Visible Barangays', (string) Barangay::count()],
            ['Summary', 'Visible Users', $user->isAdmin() ? (string) User::count() : 'Restricted'],
        ];

        foreach ($recentDocuments as $document) {
            $rows[] = [
                'Recent Document',
                $document->title,
                $document->created_at?->toDateTimeString(),
            ];
        }

        foreach ($recentActivity as $log) {
            $rows[] = [
                'Recent Activity',
                $log->action,
                $log->created_at?->toDateTimeString(),
            ];
        }

        return $this->streamCsv(
            filename: 'dashboard-summary-report.csv',
            headers: ['Section', 'Label', 'Value'],
            rows: $rows,
        );
    }

    private function streamCsv(string $filename, array $headers, array $rows): StreamedResponse
    {
        return response()->streamDownload(function () use ($headers, $rows): void {
            $handle = fopen('php://output', 'wb');

            if ($handle === false) {
                return;
            }

            fputcsv($handle, $headers);

            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
