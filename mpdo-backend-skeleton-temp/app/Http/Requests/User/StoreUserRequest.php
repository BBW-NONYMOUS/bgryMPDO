<?php

namespace App\Http\Requests\User;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', Rule::in(User::allowedRoles())],
            'barangay_id' => ['nullable', 'integer', 'exists:barangays,id'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (User::normalizeRole($this->input('role')) === User::ROLE_BARANGAY_OFFICIAL && ! $this->filled('barangay_id')) {
                    $validator->errors()->add('barangay_id', 'A barangay assignment is required for barangay officials.');
                }
            },
        ];
    }
}
