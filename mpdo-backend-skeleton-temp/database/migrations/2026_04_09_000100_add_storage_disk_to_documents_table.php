<?php

use App\Models\Document;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table
                ->string('storage_disk')
                ->default(Document::LEGACY_PUBLIC_DISK)
                ->after('description')
                ->index();
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropIndex(['storage_disk']);
            $table->dropColumn('storage_disk');
        });
    }
};

