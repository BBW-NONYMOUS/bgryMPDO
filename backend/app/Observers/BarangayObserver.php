<?php

namespace App\Observers;

use App\Models\Barangay;
use App\Services\ActivityLogService;

class BarangayObserver
{
    public function __construct(
        private readonly ActivityLogService $activityLogService,
    ) {
    }

    public function created(Barangay $barangay): void
    {
        $this->log('barangay.created', 'Created barangay '.$barangay->name.'.', $barangay);
    }

    public function updated(Barangay $barangay): void
    {
        $this->log('barangay.updated', 'Updated barangay '.$barangay->name.'.', $barangay, [
            'changes' => collect($barangay->getChanges())->except('updated_at')->all(),
        ]);
    }

    public function deleted(Barangay $barangay): void
    {
        $this->log('barangay.deleted', 'Deleted barangay '.$barangay->name.'.', $barangay);
    }

    private function log(string $action, string $description, Barangay $barangay, ?array $details = null): void
    {
        $actor = request()->user();

        if (! $actor) {
            return;
        }

        $this->activityLogService->log(
            action: $action,
            module: 'barangays',
            description: $description,
            user: $actor,
            details: array_merge([
                'barangay_id' => $barangay->id,
            ], $details ?? []),
        );
    }
}
