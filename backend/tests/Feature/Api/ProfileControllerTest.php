<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_update_profile_details(): void
    {
        $user = User::factory()->create([
            'name' => 'MPDO Staff',
            'email' => 'staff@mpdo.local',
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/auth/profile', [
            'name' => 'MPDO Staff Updated',
            'email' => 'staff.updated@mpdo.local',
            'address' => 'Poblacion, Example Town',
            'contact_number' => '09171234567',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.name', 'MPDO Staff Updated')
            ->assertJsonPath('user.email', 'staff.updated@mpdo.local')
            ->assertJsonPath('user.address', 'Poblacion, Example Town')
            ->assertJsonPath('user.contact_number', '09171234567');
    }

    public function test_user_can_change_password_with_current_password(): void
    {
        $user = User::factory()->create([
            'email' => 'staff@mpdo.local',
            'password' => Hash::make('password123'),
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/auth/profile/password', [
            'current_password' => 'password123',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertOk();

        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }

    public function test_user_can_upload_profile_photo(): void
    {
        Storage::fake('public');
        config()->set('mpdo.avatars_disk', 'public');

        $user = User::factory()->create([
            'email' => 'staff@mpdo.local',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/auth/profile/photo', [
            'photo' => UploadedFile::fake()->image('avatar.png', 200, 200),
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('user.email', 'staff@mpdo.local');

        $photoPath = $user->fresh()->profile_photo_path;
        $this->assertNotEmpty($photoPath);
        Storage::disk('public')->assertExists($photoPath);
    }

    public function test_profile_photo_is_accessible_via_storage_url(): void
    {
        Storage::fake('public');
        config()->set('mpdo.avatars_disk', 'public');

        $user = User::factory()->create([
            'email' => 'staff@mpdo.local',
        ]);

        Sanctum::actingAs($user);

        $this->postJson('/api/v1/auth/profile/photo', [
            'photo' => UploadedFile::fake()->image('avatar.png', 200, 200),
        ])->assertOk();

        $photoPath = $user->fresh()->profile_photo_path;
        $this->assertNotEmpty($photoPath);

        $response = $this->get('/storage/'.$photoPath);
        $response->assertOk();
        $this->assertStringContainsString('image/', (string) $response->headers->get('Content-Type'));
    }
}
