<?php

namespace Database\Seeders;

use App\Http\Controllers\Api\V1\SystemSettingController;
use App\Models\Document;
use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            SystemSettingController::KEY_DOCUMENT_STATUSES => Document::defaultAllowedStatuses(),
            SystemSettingController::KEY_DOCUMENT_ACCESS_LEVELS => Document::defaultAllowedAccessLevels(),
            SystemSettingController::KEY_DOCUMENT_TYPES => SystemSettingController::DEFAULT_DOCUMENT_TYPES,
            SystemSettingController::KEY_CLASSIFICATIONS => [],
        ];

        foreach ($defaults as $key => $value) {
            SystemSetting::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value],
            );
        }
    }
}
