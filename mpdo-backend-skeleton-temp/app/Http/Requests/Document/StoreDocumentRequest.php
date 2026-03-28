<?php

namespace App\Http\Requests\Document;

use App\Models\Document;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDocumentRequest extends FormRequest
{
    private const APP_MAX_KILOBYTES = 5120;

    private const DEFAULT_MAX_KILOBYTES = self::APP_MAX_KILOBYTES;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'document_number' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'barangay_id' => ['nullable', 'integer', 'exists:barangays,id'],
            'document_date' => ['nullable', 'date'],
            'keywords' => ['nullable', 'string'],
            'remarks' => ['nullable', 'string'],
            'access_level' => ['required', 'string', Rule::in(Document::allowedAccessLevels())],
            'status' => ['required', 'string', Rule::in(Document::allowedStatuses())],
            'file' => ['required', 'file', 'max:'.$this->effectiveMaxKilobytes()],
        ];
    }

    public function messages(): array
    {
        $maxMegabytes = number_format($this->effectiveMaxKilobytes() / 1024, 0);

        return [
            'file.required' => 'Please select a file to upload.',
            'file.uploaded' => "The file could not be uploaded. The current server upload limit is {$maxMegabytes} MB.",
            'file.max' => "The file is too large. The current server upload limit is {$maxMegabytes} MB.",
        ];
    }

    private function effectiveMaxKilobytes(): int
    {
        $uploadMax = $this->iniSizeToKilobytes((string) ini_get('upload_max_filesize'));
        $postMax = $this->iniSizeToKilobytes((string) ini_get('post_max_size'));

        return max(1, min(self::APP_MAX_KILOBYTES, $uploadMax, $postMax));
    }

    private function iniSizeToKilobytes(string $value): int
    {
        $value = trim($value);

        if ($value === '') {
            return self::DEFAULT_MAX_KILOBYTES;
        }

        $unit = strtolower(substr($value, -1));
        $number = (float) $value;

        $bytes = match ($unit) {
            'g' => $number * 1024 * 1024 * 1024,
            'm' => $number * 1024 * 1024,
            'k' => $number * 1024,
            default => (float) $value,
        };

        return (int) max(1, floor($bytes / 1024));
    }
}
