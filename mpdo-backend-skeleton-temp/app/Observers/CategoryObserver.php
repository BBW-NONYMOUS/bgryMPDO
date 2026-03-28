<?php

namespace App\Observers;

use App\Models\Category;
use App\Services\ActivityLogService;

class CategoryObserver
{
    public function __construct(
        private readonly ActivityLogService $activityLogService,
    ) {
    }

    public function created(Category $category): void
    {
        $this->log('category.created', 'Created category '.$category->name.'.', $category);
    }

    public function updated(Category $category): void
    {
        $this->log('category.updated', 'Updated category '.$category->name.'.', $category, [
            'changes' => collect($category->getChanges())->except('updated_at')->all(),
        ]);
    }

    public function deleted(Category $category): void
    {
        $this->log('category.deleted', 'Deleted category '.$category->name.'.', $category);
    }

    private function log(string $action, string $description, Category $category, ?array $details = null): void
    {
        $actor = request()->user();

        if (! $actor) {
            return;
        }

        $this->activityLogService->log(
            action: $action,
            module: 'categories',
            description: $description,
            user: $actor,
            details: array_merge([
                'category_id' => $category->id,
            ], $details ?? []),
        );
    }
}
