<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\SystemSetting\UpdateSystemSettingRequest;
use App\Services\SystemSettingsService;
use App\Support\DocumentUploadLimits;
use Illuminate\Http\JsonResponse;

class SystemSettingController extends Controller
{
    public const KEY_DOCUMENT_STATUSES = 'document_statuses';

    public const KEY_DOCUMENT_ACCESS_LEVELS = 'document_access_levels';

    public const KEY_DOCUMENT_TYPES = 'document_types';

    public const KEY_CLASSIFICATIONS = 'classifications';

    public function __construct(
        private readonly SystemSettingsService $systemSettingsService,
    ) {
    }

    public function index(): JsonResponse
    {
        $defaults = [
            self::KEY_DOCUMENT_STATUSES => \App\Models\Document::defaultAllowedStatuses(),
            self::KEY_DOCUMENT_ACCESS_LEVELS => \App\Models\Document::defaultAllowedAccessLevels(),
            self::KEY_DOCUMENT_TYPES => [],
            self::KEY_CLASSIFICATIONS => [],
        ];

        $settings = [];

        foreach ($defaults as $key => $default) {
            $settings[$key] = $this->systemSettingsService->get($key, $default);
        }

        return response()->json([
            'settings' => $settings,
            'upload_limits' => [
                'documents' => [
                    'max_bytes' => DocumentUploadLimits::effectiveMaxBytes(),
                    'max_megabytes' => DocumentUploadLimits::effectiveMaxMegabytes(),
                    'supported_extensions' => DocumentUploadLimits::supportedExtensions(),
                ],
            ],
        ]);
    }

    public function update(UpdateSystemSettingRequest $request, string $key): JsonResponse
    {
        $setting = $this->systemSettingsService->put($key, $request->validated()['value']);

        return response()->json([
            'message' => 'Setting updated successfully.',
            'setting' => [
                'key' => $setting->key,
                'value' => $setting->value,
            ],
        ]);
    }
}
