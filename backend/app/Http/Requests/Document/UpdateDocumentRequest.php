<?php

namespace App\Http\Requests\Document;

use App\Models\Document;
use App\Support\DocumentUploadLimits;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDocumentRequest extends FormRequest
{
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
            'file' => ['nullable', 'file', 'mimes:'.DocumentUploadLimits::supportedExtensionsRule(), 'max:'.DocumentUploadLimits::effectiveMaxKilobytes()],
        ];
    }

    public function messages(): array
    {
        $maxMegabytes = DocumentUploadLimits::effectiveMaxMegabytes();

        return [
            'file.uploaded' => "The file could not be uploaded. The current server upload limit is {$maxMegabytes} MB.",
            'file.mimes' => 'Only PDF, DOCX, XLSX, PPT, JPG, and PNG files are supported.',
            'file.max' => "The file is too large. The current server upload limit is {$maxMegabytes} MB.",
        ];
    }
}
