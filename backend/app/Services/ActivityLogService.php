<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\Request;

class ActivityLogService
{
    public function log(
        string $action,
        string $module,
        ?string $description = null,
        ?User $user = null,
        ?Document $document = null,
        ?array $details = null,
        ?Request $request = null,
    ): ActivityLog {
        $request ??= request();

        return ActivityLog::create([
            'user_id' => $user?->id,
            'document_id' => $document?->id,
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'details' => $details,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'created_at' => now(),
        ]);
    }
}
