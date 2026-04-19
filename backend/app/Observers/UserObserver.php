<?php

namespace App\Observers;

use App\Models\User;
use App\Services\ActivityLogService;

class UserObserver
{
    public function __construct(
        private readonly ActivityLogService $activityLogService,
    ) {
    }

    public function created(User $user): void
    {
        $actor = request()->user();

        if (! $actor) {
            return;
        }

        $this->activityLogService->log(
            action: 'user.created',
            module: 'users',
            description: "Created user {$user->name}.",
            user: $actor,
            details: [
                'target_user_id' => $user->id,
                'role' => $user->role,
            ],
        );
    }

    public function updated(User $user): void
    {
        $actor = request()->user();

        if (! $actor) {
            return;
        }

        $changes = collect($user->getChanges())
            ->except(['updated_at', 'password', 'remember_token'])
            ->all();

        if ($changes === []) {
            return;
        }

        $this->activityLogService->log(
            action: 'user.updated',
            module: 'users',
            description: "Updated user {$user->name}.",
            user: $actor,
            details: [
                'target_user_id' => $user->id,
                'changes' => $changes,
            ],
        );
    }

    public function deleted(User $user): void
    {
        $actor = request()->user();

        if (! $actor) {
            return;
        }

        $this->activityLogService->log(
            action: 'user.deleted',
            module: 'users',
            description: "Deleted user {$user->name}.",
            user: $actor,
            details: [
                'target_user_id' => $user->id,
                'email' => $user->email,
            ],
        );
    }
}
