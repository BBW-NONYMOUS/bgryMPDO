<?php

namespace App\Http\Requests\User;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateUserRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->input('password') === '') {
            $this->merge(['password' => null]);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var User $user */
        $user = $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'password' => ['nullable', 'string', 'min:8'],
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
