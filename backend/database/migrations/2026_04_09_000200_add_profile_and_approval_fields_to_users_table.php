<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('address')->nullable()->after('name');
            $table->string('contact_number', 50)->nullable()->after('address');
            $table->string('profile_photo_path')->nullable()->after('contact_number');

            $table->string('account_status')->default('pending')->after('is_active')->index();
            $table->text('account_status_remark')->nullable()->after('account_status');
            $table->foreignId('account_status_updated_by')
                ->nullable()
                ->after('account_status_remark')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('account_status_updated_at')->nullable()->after('account_status_updated_by');
        });

        // Existing installations already have active users; keep them usable after this change.
        DB::table('users')->update([
            'account_status' => 'approved',
            'account_status_updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['address', 'contact_number', 'profile_photo_path', 'account_status_remark', 'account_status_updated_at']);
            $table->dropConstrainedForeignId('account_status_updated_by');
            $table->dropIndex(['account_status']);
            $table->dropColumn('account_status');
        });
    }
};

