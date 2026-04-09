<?php

namespace Database\Seeders;

use App\Models\Barangay;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class StarterDataSeeder extends Seeder
{
    public function run(): void
    {
        $barangays = collect([
            ['name' => 'Poblacion', 'code' => 'POB', 'description' => 'Central municipal district.', 'is_active' => true],
            ['name' => 'San Isidro', 'code' => 'SI', 'description' => 'Agricultural and mixed residential area.', 'is_active' => true],
            ['name' => 'Santa Cruz', 'code' => 'SC', 'description' => 'Northern barangay coverage area.', 'is_active' => true],
        ])->mapWithKeys(function (array $barangay): array {
            $record = Barangay::query()->updateOrCreate(
                ['name' => $barangay['name']],
                $barangay,
            );

            return [$record->name => $record];
        });

        foreach ([
            ['name' => 'Development Plans', 'description' => 'Municipal and barangay development planning documents.'],
            ['name' => 'Permits and Clearances', 'description' => 'Permits, endorsements, and formal clearances.'],
            ['name' => 'Infrastructure Reports', 'description' => 'Progress reports, inspections, and project records.'],
            ['name' => 'Maps and Blueprints', 'description' => 'Technical drawings, maps, and reference layouts.'],
        ] as $category) {
            Category::query()->updateOrCreate(
                ['name' => $category['name']],
                ['description' => $category['description'], 'is_active' => true],
            );
        }

        $this->seedUser([
            'email' => 'admin@mpdo.local',
            'name' => 'MPDO Administrator',
            'username' => 'admin',
            'password' => 'password123',
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
            'account_status' => User::ACCOUNT_APPROVED,
            'account_status_updated_at' => now(),
            'email_verified_at' => now(),
            'barangay_id' => null,
        ]);

        $this->seedUser([
            'email' => 'staff@mpdo.local',
            'name' => 'MPDO Staff',
            'username' => 'staff',
            'password' => 'password123',
            'role' => User::ROLE_STAFF,
            'is_active' => true,
            'account_status' => User::ACCOUNT_APPROVED,
            'account_status_updated_at' => now(),
            'email_verified_at' => now(),
            'barangay_id' => null,
        ]);

        $this->seedUser([
            'email' => 'barangay@mpdo.local',
            'name' => 'Barangay Official',
            'username' => 'barangay',
            'password' => 'password123',
            'role' => User::ROLE_BARANGAY_OFFICIAL,
            'is_active' => true,
            'account_status' => User::ACCOUNT_APPROVED,
            'account_status_updated_at' => now(),
            'email_verified_at' => now(),
            'barangay_id' => $barangays['Poblacion']->id,
        ]);
    }

    private function seedUser(array $attributes): void
    {
        $user = User::query()
            ->where('username', $attributes['username'])
            ->orWhere('email', $attributes['email'])
            ->first();

        if ($user) {
            $user->fill($attributes);
            $user->save();

            return;
        }

        User::query()->create($attributes);
    }
}
