<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfilePhotoRequest extends FormRequest
{
    private const MAX_KILOBYTES = 2048;

    private const SUPPORTED_EXTENSIONS = 'jpg,jpeg,png';

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'photo' => ['required', 'file', 'mimes:'.self::SUPPORTED_EXTENSIONS, 'max:'.self::MAX_KILOBYTES],
        ];
    }
}

