<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Document */
class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'document_number' => $this->document_number,
            'description' => $this->description,
            'file_name' => $this->original_file_name,
            'stored_file_name' => $this->file_name,
            'file_type' => $this->file_type,
            'file_size' => $this->file_size,
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'barangay' => BarangayResource::make($this->whenLoaded('barangay')),
            'uploader' => UserResource::make($this->whenLoaded('uploader')),
            'document_date' => $this->document_date?->toDateString(),
            'keywords' => $this->keywords,
            'remarks' => $this->remarks,
            'access_level' => $this->access_level,
            'status' => $this->status,
            'uploaded_at' => $this->created_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
