<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Document;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DocumentFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorized_user_can_export_documents_report(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
        ]);

        $category = Category::query()->create([
            'name' => 'Development Plans',
            'description' => 'Municipal planning documents',
            'is_active' => true,
        ]);

        Document::query()->create([
            'title' => 'Annual Investment Plan 2026',
            'document_number' => 'AIP-2026-001',
            'description' => 'Approved annual investment plan',
            'file_name' => 'annual-investment-plan-2026.pdf',
            'original_file_name' => 'annual-investment-plan-2026.pdf',
            'file_path' => 'documents/annual-investment-plan-2026.pdf',
            'file_type' => 'application/pdf',
            'file_size' => 2048,
            'category_id' => $category->id,
            'uploaded_by' => $admin->id,
            'document_date' => '2026-03-15',
            'keywords' => 'annual,investment,plan',
            'access_level' => Document::ACCESS_STAFF,
            'status' => Document::STATUS_ACTIVE,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->get('/api/v1/reports/documents');

        $response->assertOk();
        $this->assertStringContainsString('text/csv', (string) $response->headers->get('content-type'));
        $this->assertStringContainsString('Annual Investment Plan 2026', $response->streamedContent());
    }

    public function test_store_document_rejects_unsupported_file_type(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
        ]);

        $category = Category::query()->create([
            'name' => 'Reports',
            'description' => 'Generated reports',
            'is_active' => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/documents', [
            'title' => 'Unsupported Notes File',
            'category_id' => $category->id,
            'access_level' => Document::ACCESS_STAFF,
            'status' => Document::STATUS_DRAFT,
            'file' => UploadedFile::fake()->create('notes.txt', 10, 'text/plain'),
        ]);

        $response->assertJsonValidationErrors('file');
    }
}
