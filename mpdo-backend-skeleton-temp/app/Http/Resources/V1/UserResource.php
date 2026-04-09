<?php

namespace App\Http\Resources\V1;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/** @mixin \App\Models\User */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $avatarDisk = (string) config('mpdo.avatars_disk', 'public');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'address' => $this->address,
            'contact_number' => $this->contact_number,
            'email' => $this->email,
            'username' => $this->username,
            'profile_photo_url' => $this->profile_photo_path
                ? Storage::disk($avatarDisk)->url($this->profile_photo_path)
                : null,
            'role' => User::roleForApi($this->role),
            'is_active' => (bool) $this->is_active,
            'account_status' => $this->account_status,
            'account_status_remark' => $this->account_status_remark,
            'account_status_updated_at' => $this->account_status_updated_at?->toISOString(),
            'barangay' => BarangayResource::make($this->whenLoaded('barangay')),
            'documents_count' => $this->whenCounted('uploadedDocuments'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
