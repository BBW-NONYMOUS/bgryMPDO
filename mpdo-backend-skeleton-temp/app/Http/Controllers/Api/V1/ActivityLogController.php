<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ActivityLogResource;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'action' => ['nullable', 'string'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $logs = ActivityLog::query()
            ->with(['user.barangay', 'document.category', 'document.barangay'])
            ->filter($validated)
            ->paginate((int) ($validated['per_page'] ?? 15))
            ->withQueryString();

        return ActivityLogResource::collection($logs);
    }
}
