<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\ActivityLog */
class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'module' => $this->module,
            'description' => $this->description,
            'details' => $this->details,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'user' => UserResource::make($this->whenLoaded('user')),
            'document' => DocumentResource::make($this->whenLoaded('document')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
