<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Cache;
use Throwable;

class SystemSettingsService
{
    public function get(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever($this->cacheKey($key), function () use ($key, $default) {
            try {
                $setting = SystemSetting::query()->where('key', $key)->first();
            } catch (Throwable) {
                return $default;
            }

            return $setting?->value ?? $default;
        });
    }

    public function put(string $key, mixed $value): SystemSetting
    {
        $setting = SystemSetting::query()->updateOrCreate(
            ['key' => $key],
            ['value' => $value],
        );

        Cache::forget($this->cacheKey($key));

        return $setting;
    }

    private function cacheKey(string $key): string
    {
        return "mpdo.system_settings.{$key}";
    }
}
