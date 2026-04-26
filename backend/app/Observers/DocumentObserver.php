<?php

namespace App\Observers;

use App\Models\Document;
use App\Services\ActivityLogService;

class DocumentObserver
{
    public function __construct(
        private readonly ActivityLogService $activityLogService,
    ) {
    }

    public function created(Document $document): void
    {
        $this->log('document.created', 'Uploaded document '.$document->title.'.', $document);
    }

    public function updated(Document $document): void
    {
        $changes = collect($document->getChanges())
            ->except(['updated_at', 'file_path', 'file_name'])
            ->all();

        if ($changes === []) {
            return;
        }

        $this->log('document.updated', 'Updated document '.$document->title.'.', $document, [
            'changes' => $changes,
        ]);
    }

    public function deleting(Document $document): void
    {
        $this->log('document.deleted', 'Deleted document '.$document->title.'.', $document);
    }

    private function log(string $action, string $description, Document $document, ?array $details = null): void
    {
        $actor = request()->user();

        if (! $actor) {
            return;
        }

        $this->activityLogService->log(
            action: $action,
            module: 'documents',
            description: $description,
            user: $actor,
            document: $document,
            details: array_merge([
                'document_id' => $document->id,
            ], $details ?? []),
        );
    }
}
