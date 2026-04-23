<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DataManagementController extends Controller
{
    public function seed(): JsonResponse
    {
        Artisan::call('db:seed', ['--class' => 'ArchiveDemoSeeder', '--force' => true]);

        return response()->json(['message' => 'Test data seeded successfully.']);
    }

    public function backup(): Response
    {
        $config = config('database.connections.mysql');

        $fileName = 'backup-' . now()->format('Y-m-d-His') . '.sql';

        $command = sprintf(
            'mysqldump --user=%s --password=%s --host=%s --port=%s %s 2>/dev/null',
            escapeshellarg((string) $config['username']),
            escapeshellarg((string) $config['password']),
            escapeshellarg((string) $config['host']),
            escapeshellarg((string) ($config['port'] ?? '3306')),
            escapeshellarg((string) $config['database']),
        );

        $output = [];
        exec($command, $output);
        $sql = implode(PHP_EOL, $output);

        return response($sql, 200, [
            'Content-Type' => 'application/octet-stream',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ]);
    }

    public function restore(Request $request): JsonResponse
    {
        $request->validate([
            'backup' => ['required', 'file', 'mimes:sql,txt'],
        ]);

        $sql = file_get_contents($request->file('backup')->getRealPath());

        DB::unprepared($sql);

        return response()->json(['message' => 'Database restored successfully.']);
    }

    public function reset(): JsonResponse
    {
        ActivityLog::query()->delete();

        Document::all()->each(function (Document $document): void {
            if ($document->file_path) {
                Storage::disk($document->storage_disk ?? 'local')->delete($document->file_path);
            }

            $document->delete();
        });

        User::query()->where('role', '!=', User::ROLE_ADMIN)->delete();

        return response()->json(['message' => 'Data reset successfully. Admin accounts and settings have been preserved.']);
    }
}
