<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('mpdo:migrate-document-storage {--from=public} {--to=} {--dry-run}', function () {
    $from = (string) $this->option('from');
    $to = (string) ($this->option('to') ?: config('mpdo.documents_disk', 'local'));
    $dryRun = (bool) $this->option('dry-run');

    $this->info("Migrating document files from [{$from}] to [{$to}]".($dryRun ? ' (dry-run)' : '').'...');

    $fromDisk = Storage::disk($from);
    $toDisk = Storage::disk($to);

    $query = \App\Models\Document::query()
        ->where('storage_disk', $from)
        ->orderBy('id');

    $total = (int) $query->count();
    $migrated = 0;
    $skipped = 0;
    $missing = 0;

    $query->chunkById(200, function ($documents) use ($fromDisk, $toDisk, $to, $dryRun, &$migrated, &$skipped, &$missing): void {
        foreach ($documents as $document) {
            /** @var \App\Models\Document $document */
            $path = $document->file_path;

            if (! $path) {
                $skipped++;
                continue;
            }

            if (! $fromDisk->exists($path)) {
                $this->warn("Missing source file for document #{$document->id}: {$path}");
                $missing++;
                continue;
            }

            if ($toDisk->exists($path)) {
                $this->warn("Target already exists for document #{$document->id}: {$path} (skipping)");
                $skipped++;
                continue;
            }

            if ($dryRun) {
                $migrated++;
                continue;
            }

            $stream = $fromDisk->readStream($path);
            if (! $stream) {
                $this->warn("Unable to read stream for document #{$document->id}: {$path}");
                $skipped++;
                continue;
            }

            $toDisk->writeStream($path, $stream);
            if (is_resource($stream)) {
                fclose($stream);
            }

            $fromDisk->delete($path);

            $document->forceFill(['storage_disk' => $to])->save();
            $migrated++;
        }
    });

    $this->newLine();
    $this->info("Total: {$total}");
    $this->info("Migrated: {$migrated}");
    $this->info("Skipped: {$skipped}");
    $this->info("Missing: {$missing}");
})->purpose('Move archived document files from the public disk to private storage');
