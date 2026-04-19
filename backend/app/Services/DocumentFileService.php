<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentFileService
{
    public function __construct(
        private readonly ?string $disk = null,
    ) {
    }

    public function store(UploadedFile $file): array
    {
        $disk = $this->disk ?? (string) config('mpdo.documents_disk', 'local');
        $extension = $file->getClientOriginalExtension();
        $fileName = Str::uuid()->toString().'.'.$extension;
        $path = $file->storeAs('documents', $fileName, $disk);

        return [
            'storage_disk' => $disk,
            'file_name' => $fileName,
            'original_file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getClientMimeType() ?? $file->getMimeType() ?? $extension,
            'file_size' => $file->getSize(),
        ];
    }

    public function delete(?string $path, ?string $disk = null): void
    {
        $disk ??= $this->disk ?? (string) config('mpdo.documents_disk', 'local');

        if ($path && Storage::disk($disk)->exists($path)) {
            Storage::disk($disk)->delete($path);
        }
    }
}
