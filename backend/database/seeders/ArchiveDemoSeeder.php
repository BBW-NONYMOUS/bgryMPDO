<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Barangay;
use App\Models\Category;
use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ArchiveDemoSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::query()
            ->get()
            ->keyBy('name');

        $barangays = Barangay::query()
            ->get()
            ->keyBy('name');

        $users = collect([
            $this->seedUser([
                'name' => 'Municipal Planning Officer',
                'email' => 'planner@mpdo.local',
                'username' => 'planner',
                'password' => 'password123',
                'role' => User::ROLE_STAFF,
                'is_active' => true,
                'account_status' => User::ACCOUNT_APPROVED,
                'account_status_remark' => 'Provisioned for planning operations.',
                'account_status_updated_at' => now()->subDays(10),
                'email_verified_at' => now()->subDays(10),
            ]),
            $this->seedUser([
                'name' => 'Records Assistant',
                'email' => 'records@mpdo.local',
                'username' => 'records',
                'password' => 'password123',
                'role' => User::ROLE_STAFF,
                'is_active' => true,
                'account_status' => User::ACCOUNT_APPROVED,
                'account_status_remark' => 'Assigned to archive desk.',
                'account_status_updated_at' => now()->subDays(8),
                'email_verified_at' => now()->subDays(8),
            ]),
            $this->seedUser([
                'name' => 'Santa Cruz Barangay Secretary',
                'email' => 'santacruz@mpdo.local',
                'username' => 'santacruz',
                'password' => 'password123',
                'role' => User::ROLE_BARANGAY_OFFICIAL,
                'is_active' => true,
                'account_status' => User::ACCOUNT_APPROVED,
                'account_status_remark' => 'Approved barangay access.',
                'account_status_updated_at' => now()->subDays(7),
                'email_verified_at' => now()->subDays(7),
                'barangay_id' => $barangays['Santa Cruz']?->id,
            ]),
            $this->seedUser([
                'name' => 'Pending Barangay Applicant',
                'email' => 'pending@mpdo.local',
                'username' => 'pending_applicant',
                'password' => 'password123',
                'role' => User::ROLE_BARANGAY_OFFICIAL,
                'is_active' => true,
                'account_status' => User::ACCOUNT_PENDING,
                'account_status_remark' => 'Awaiting identity verification.',
                'account_status_updated_at' => now()->subDays(3),
                'barangay_id' => $barangays['San Isidro']?->id,
            ]),
            $this->seedUser([
                'name' => 'Rejected Account Applicant',
                'email' => 'rejected@mpdo.local',
                'username' => 'rejected_applicant',
                'password' => 'password123',
                'role' => User::ROLE_BARANGAY_OFFICIAL,
                'is_active' => false,
                'account_status' => User::ACCOUNT_REJECTED,
                'account_status_remark' => 'Incomplete supporting documents.',
                'account_status_updated_at' => now()->subDays(2),
                'barangay_id' => $barangays['Poblacion']?->id,
            ]),
        ])->keyBy('username');

        $documents = collect([
            [
                'title' => 'Municipal Development Plan 2026',
                'document_number' => 'DEMO-PLN-2026-001',
                'description' => 'Annual planning framework for municipal programs and capital projects.',
                'category' => 'Development Plans',
                'barangay' => null,
                'uploader' => 'planner',
                'document_date' => now()->subDays(6)->toDateString(),
                'keywords' => 'planning, annual investment program, strategy',
                'remarks' => 'Seeded demo file for dashboard and document listing.',
                'access_level' => Document::ACCESS_ADMIN,
                'status' => Document::STATUS_ACTIVE,
                'days_ago' => 6,
                'time' => '08:15:00',
            ],
            [
                'title' => 'Poblacion Road Rehabilitation Progress Report',
                'document_number' => 'DEMO-INF-2026-002',
                'description' => 'Progress tracking report for the main road rehabilitation package.',
                'category' => 'Infrastructure Reports',
                'barangay' => 'Poblacion',
                'uploader' => 'records',
                'document_date' => now()->subDays(5)->toDateString(),
                'keywords' => 'roads, rehabilitation, progress update',
                'remarks' => 'Contains milestone summary for site inspection.',
                'access_level' => Document::ACCESS_STAFF,
                'status' => Document::STATUS_ACTIVE,
                'days_ago' => 5,
                'time' => '10:30:00',
            ],
            [
                'title' => 'San Isidro Barangay Clearance Template',
                'document_number' => 'DEMO-PRM-2026-003',
                'description' => 'Reference clearance template used for barangay document requests.',
                'category' => 'Permits and Clearances',
                'barangay' => 'San Isidro',
                'uploader' => 'records',
                'document_date' => now()->subDays(4)->toDateString(),
                'keywords' => 'clearance, template, permit',
                'remarks' => 'Internal draft for staff review.',
                'access_level' => Document::ACCESS_STAFF,
                'status' => Document::STATUS_DRAFT,
                'days_ago' => 4,
                'time' => '14:10:00',
            ],
            [
                'title' => 'Santa Cruz Drainage Layout',
                'document_number' => 'DEMO-MAP-2026-004',
                'description' => 'Drainage alignment map for the Santa Cruz flood mitigation package.',
                'category' => 'Maps and Blueprints',
                'barangay' => 'Santa Cruz',
                'uploader' => 'santacruz',
                'document_date' => now()->subDays(3)->toDateString(),
                'keywords' => 'drainage, flood control, layout',
                'remarks' => 'Shared with barangay users for validation.',
                'access_level' => Document::ACCESS_BARANGAY,
                'status' => Document::STATUS_ACTIVE,
                'days_ago' => 3,
                'time' => '09:45:00',
            ],
            [
                'title' => 'Quarterly Archive Inventory',
                'document_number' => 'DEMO-ADM-2026-005',
                'description' => 'Inventory summary of archived planning and infrastructure records.',
                'category' => 'Infrastructure Reports',
                'barangay' => null,
                'uploader' => 'records',
                'document_date' => now()->subDays(2)->toDateString(),
                'keywords' => 'inventory, records, quarterly',
                'remarks' => 'Archived after records validation.',
                'access_level' => Document::ACCESS_ADMIN,
                'status' => Document::STATUS_ARCHIVED,
                'days_ago' => 2,
                'time' => '11:20:00',
            ],
            [
                'title' => 'General Barangay Project Tracker',
                'document_number' => 'DEMO-PLN-2026-006',
                'description' => 'Cross-barangay status tracker for priority projects.',
                'category' => 'Development Plans',
                'barangay' => null,
                'uploader' => 'planner',
                'document_date' => now()->subDay()->toDateString(),
                'keywords' => 'projects, tracker, barangay coordination',
                'remarks' => 'Visible to barangay officials across the municipality.',
                'access_level' => Document::ACCESS_BARANGAY,
                'status' => Document::STATUS_ACTIVE,
                'days_ago' => 1,
                'time' => '15:35:00',
            ],
            [
                'title' => 'Poblacion Zoning Reference Notes',
                'document_number' => 'DEMO-MAP-2026-007',
                'description' => 'Working notes and zoning references for central district review.',
                'category' => 'Maps and Blueprints',
                'barangay' => 'Poblacion',
                'uploader' => 'planner',
                'document_date' => now()->toDateString(),
                'keywords' => 'zoning, references, planning notes',
                'remarks' => 'Latest uploaded sample document.',
                'access_level' => Document::ACCESS_STAFF,
                'status' => Document::STATUS_ACTIVE,
                'days_ago' => 0,
                'time' => '09:10:00',
            ],
        ])->mapWithKeys(function (array $definition) use ($categories, $barangays, $users): array {
            $category = $categories[$definition['category']] ?? null;
            $barangay = $definition['barangay'] ? ($barangays[$definition['barangay']] ?? null) : null;
            $uploader = $users[$definition['uploader']] ?? User::query()->where('username', $definition['uploader'])->first();

            $createdAt = Carbon::parse(sprintf('%s %s', now()->subDays($definition['days_ago'])->toDateString(), $definition['time']));
            $fileData = $this->buildFilePayload($definition, $createdAt);

            $document = Document::query()->firstOrNew([
                'document_number' => $definition['document_number'],
            ]);

            $document->fill([
                'title' => $definition['title'],
                'description' => $definition['description'],
                'storage_disk' => $fileData['storage_disk'],
                'file_name' => $fileData['file_name'],
                'original_file_name' => $fileData['original_file_name'],
                'file_path' => $fileData['file_path'],
                'file_type' => $fileData['file_type'],
                'file_size' => $fileData['file_size'],
                'category_id' => $category?->id,
                'barangay_id' => $barangay?->id,
                'uploaded_by' => $uploader?->id,
                'document_date' => $definition['document_date'],
                'keywords' => $definition['keywords'],
                'remarks' => $definition['remarks'],
                'access_level' => $definition['access_level'],
                'status' => $definition['status'],
            ]);

            $document->timestamps = false;
            $document->created_at = $createdAt;
            $document->updated_at = $createdAt->copy()->addHours(2);
            $document->save();

            return [$definition['document_number'] => $document];
        });

        $this->seedActivityLog([
            'action' => 'auth.login',
            'module' => 'auth',
            'description' => 'Seeded activity: administrator login.',
            'user_id' => User::query()->where('username', 'admin')->value('id'),
            'document_id' => null,
            'created_at' => now()->subDays(6)->setTime(7, 50),
            'details' => ['seed_key' => 'admin-login'],
        ]);

        $this->seedActivityLog([
            'action' => 'document.created',
            'module' => 'documents',
            'description' => 'Seeded activity: uploaded Municipal Development Plan 2026.',
            'user_id' => $users['planner']?->id,
            'document_id' => $documents['DEMO-PLN-2026-001']?->id,
            'created_at' => now()->subDays(6)->setTime(8, 20),
            'details' => ['seed_key' => 'document-created-1'],
        ]);

        $this->seedActivityLog([
            'action' => 'document.updated',
            'module' => 'documents',
            'description' => 'Seeded activity: updated Poblacion Road Rehabilitation Progress Report.',
            'user_id' => $users['records']?->id,
            'document_id' => $documents['DEMO-INF-2026-002']?->id,
            'created_at' => now()->subDays(5)->setTime(13, 5),
            'details' => ['seed_key' => 'document-updated-1'],
        ]);

        $this->seedActivityLog([
            'action' => 'user.approved',
            'module' => 'users',
            'description' => 'Seeded activity: approved Santa Cruz Barangay Secretary.',
            'user_id' => User::query()->where('username', 'admin')->value('id'),
            'document_id' => null,
            'created_at' => now()->subDays(4)->setTime(9, 30),
            'details' => ['seed_key' => 'user-approved-1'],
        ]);

        $this->seedActivityLog([
            'action' => 'document.previewed',
            'module' => 'documents',
            'description' => 'Seeded activity: previewed Santa Cruz Drainage Layout.',
            'user_id' => $users['santacruz']?->id,
            'document_id' => $documents['DEMO-MAP-2026-004']?->id,
            'created_at' => now()->subDays(3)->setTime(10, 0),
            'details' => ['seed_key' => 'document-previewed-1'],
        ]);

        $this->seedActivityLog([
            'action' => 'document.downloaded',
            'module' => 'documents',
            'description' => 'Seeded activity: downloaded General Barangay Project Tracker.',
            'user_id' => User::query()->where('username', 'barangay')->value('id'),
            'document_id' => $documents['DEMO-PLN-2026-006']?->id,
            'created_at' => now()->subDay()->setTime(16, 5),
            'details' => ['seed_key' => 'document-downloaded-1'],
        ]);

        $this->seedActivityLog([
            'action' => 'document.created',
            'module' => 'documents',
            'description' => 'Seeded activity: uploaded Poblacion Zoning Reference Notes.',
            'user_id' => $users['planner']?->id,
            'document_id' => $documents['DEMO-MAP-2026-007']?->id,
            'created_at' => now()->setTime(9, 15),
            'details' => ['seed_key' => 'document-created-2'],
        ]);
    }

    private function seedUser(array $attributes): User
    {
        $user = User::query()
            ->where('username', $attributes['username'])
            ->orWhere('email', $attributes['email'])
            ->first();

        if ($user) {
            $user->fill($attributes);
            $user->save();

            return $user->fresh();
        }

        return User::query()->create($attributes);
    }

    private function buildFilePayload(array $definition, Carbon $createdAt): array
    {
        $disk = (string) config('mpdo.documents_disk', 'local');
        $slug = Str::slug($definition['document_number']);
        $fileName = $slug.'.txt';
        $path = 'documents/demo/'.$fileName;

        $content = implode(PHP_EOL, [
            'MPDO Demo Archive Document',
            'Title: '.$definition['title'],
            'Document Number: '.$definition['document_number'],
            'Category: '.$definition['category'],
            'Barangay: '.($definition['barangay'] ?? 'All'),
            'Status: '.$definition['status'],
            'Access Level: '.$definition['access_level'],
            'Generated At: '.$createdAt->toDateTimeString(),
            '',
            $definition['description'],
            '',
            'Keywords: '.$definition['keywords'],
            'Remarks: '.$definition['remarks'],
        ]);

        Storage::disk($disk)->put($path, $content);

        return [
            'storage_disk' => $disk,
            'file_name' => $fileName,
            'original_file_name' => $fileName,
            'file_path' => $path,
            'file_type' => 'text/plain',
            'file_size' => strlen($content),
        ];
    }

    private function seedActivityLog(array $attributes): void
    {
        ActivityLog::query()->updateOrCreate(
            [
                'action' => $attributes['action'],
                'description' => $attributes['description'],
            ],
            [
                'module' => $attributes['module'],
                'user_id' => $attributes['user_id'],
                'document_id' => $attributes['document_id'],
                'details' => $attributes['details'] ?? null,
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Seeder/DemoData',
                'created_at' => $attributes['created_at'],
            ],
        );
    }
}
