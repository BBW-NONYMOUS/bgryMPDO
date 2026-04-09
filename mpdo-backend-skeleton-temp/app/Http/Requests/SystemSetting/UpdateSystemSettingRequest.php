<?php

namespace App\Http\Requests\SystemSetting;

use App\Http\Controllers\Api\V1\SystemSettingController;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateSystemSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $key = (string) $this->route('key');

        return [
            'value' => match ($key) {
                SystemSettingController::KEY_DOCUMENT_STATUSES => ['required', 'array', 'min:1'],
                SystemSettingController::KEY_DOCUMENT_ACCESS_LEVELS => ['required', 'array', 'min:1'],
                SystemSettingController::KEY_DOCUMENT_TYPES,
                SystemSettingController::KEY_CLASSIFICATIONS => ['nullable', 'array'],
                default => ['prohibited'],
            },
            'value.*' => ['string', 'max:255'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $key = (string) $this->route('key');
                $values = $this->input('value', []);

                if (! is_array($values)) {
                    return;
                }

                if ($key === SystemSettingController::KEY_DOCUMENT_ACCESS_LEVELS) {
                    foreach (['admin', 'staff', 'barangay'] as $required) {
                        if (! in_array($required, $values, true)) {
                            $validator->errors()->add('value', "Access level list must include '{$required}'.");
                        }
                    }
                }

                if ($key === SystemSettingController::KEY_DOCUMENT_STATUSES) {
                    foreach (['draft', 'active', 'archived'] as $required) {
                        if (! in_array($required, $values, true)) {
                            $validator->errors()->add('value', "Status list must include '{$required}'.");
                        }
                    }
                }
            },
        ];
    }
}
