<?php

namespace App\Http\Requests\Barangay;

use App\Models\Barangay;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBarangayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Barangay $barangay */
        $barangay = $this->route('barangay');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('barangays', 'name')->ignore($barangay?->id)],
            'code' => ['nullable', 'string', 'max:50', Rule::unique('barangays', 'code')->ignore($barangay?->id)],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
