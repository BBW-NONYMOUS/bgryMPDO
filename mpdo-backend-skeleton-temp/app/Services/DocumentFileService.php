<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentFileService
{
    public function __construct(
        private readonly string $disk = 'public',
    ) {
    }

    public function store(UploadedFile $file): array
    {
        $extension = $file->getClientOriginalExtension();
        $fileName = Str::uuid()->toString().'.'.$extension;
        $path = $file->storeAs('documents', $fileName, $this->disk);

        return [
            'file_name' => $fileName,
            'original_file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getClientMimeType() ?? $file->getMimeType() ?? $extension,
            'file_size' => $file->getSize(),
        ];
    }

    public function delete(?string $path): void
    {
        if ($path && Storage::disk($this->disk)->exists($path)) {
            Storage::disk($this->disk)->delete($path);
        }
    }
}
