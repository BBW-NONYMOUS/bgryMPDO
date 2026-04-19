<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('document_number')->nullable()->index();
            $table->text('description')->nullable();
            $table->string('file_name');
            $table->string('original_file_name');
            $table->string('file_path');
            $table->string('file_type');
            $table->unsignedBigInteger('file_size');
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('barangay_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('document_date')->nullable()->index();
            $table->text('keywords')->nullable();
            $table->text('remarks')->nullable();
            $table->string('access_level')->default('staff')->index();
            $table->string('status')->default('draft')->index();
            $table->timestamps();

            $table->index(['category_id', 'status']);
            $table->index(['barangay_id', 'access_level']);
            $table->index(['uploaded_by', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
