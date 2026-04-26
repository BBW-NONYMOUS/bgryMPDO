<?php

namespace App\Support;

class DocumentUploadLimits
{
    private const APP_MAX_KILOBYTES = 61440;

    private const DEFAULT_MAX_KILOBYTES = self::APP_MAX_KILOBYTES;

    private const SUPPORTED_EXTENSIONS = [
        'pdf',
        'docx',
        'xlsx',
        'ppt',
        'pptx',
        'jpg',
        'jpeg',
        'png',
    ];

    public static function supportedExtensions(): array
    {
        return self::SUPPORTED_EXTENSIONS;
    }

    public static function supportedExtensionsRule(): string
    {
        return implode(',', self::SUPPORTED_EXTENSIONS);
    }

    public static function effectiveMaxKilobytes(): int
    {
        $uploadMax = self::iniSizeToKilobytes((string) ini_get('upload_max_filesize'));
        $postMax = self::iniSizeToKilobytes((string) ini_get('post_max_size'));

        return max(1, min(self::APP_MAX_KILOBYTES, $uploadMax, $postMax));
    }

    public static function effectiveMaxBytes(): int
    {
        return self::effectiveMaxKilobytes() * 1024;
    }

    public static function effectiveMaxMegabytes(): int
    {
        return (int) max(1, floor(self::effectiveMaxKilobytes() / 1024));
    }

    private static function iniSizeToKilobytes(string $value): int
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
