<?php

namespace Tests\Feature\Api;

use App\Models\Barangay;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_barangay_user_without_providing_username(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
        ]);

        $barangay = Barangay::query()->create([
            'name' => 'Poblacion',
            'code' => 'POB',
            'is_active' => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/users', [
            'name' => 'Juan Dela Cruz',
            'email' => 'juan.dela.cruz@mpdo.local',
            'password' => 'password123',
            'role' => User::ROLE_BARANGAY_ALIAS,
            'barangay_id' => $barangay->id,
            'is_active' => true,
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('user.role', User::ROLE_BARANGAY_ALIAS)
            ->assertJsonPath('user.barangay.name', 'Poblacion')
            ->assertJsonPath('user.username', 'juan_dela_cruz');

        $this->assertDatabaseHas('users', [
            'email' => 'juan.dela.cruz@mpdo.local',
            'username' => 'juan_dela_cruz',
            'role' => User::ROLE_BARANGAY_OFFICIAL,
            'barangay_id' => $barangay->id,
        ]);
    }

    public function test_admin_can_suspend_user_without_deleting_profile_data(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
        ]);

        $user = User::factory()->create([
            'name' => 'Suspension Target',
            'is_active' => true,
            'account_status' => User::ACCOUNT_APPROVED,
        ]);
        $user->createToken('mpdo-api');

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/v1/users/{$user->id}/suspend", [
            'remark' => 'Temporary hold',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'User suspended successfully.')
            ->assertJsonPath('user.is_active', false)
            ->assertJsonPath('user.name', 'Suspension Target');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Suspension Target',
            'is_active' => false,
            'account_status_remark' => 'Temporary hold',
        ]);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_admin_can_unsuspend_user_and_preserve_data(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
        ]);

        $user = User::factory()->create([
            'name' => 'Reactivation Target',
            'is_active' => false,
            'account_status' => User::ACCOUNT_APPROVED,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/v1/users/{$user->id}/unsuspend");

        $response
            ->assertOk()
            ->assertJsonPath('message', 'User reactivated successfully.')
            ->assertJsonPath('user.is_active', true)
            ->assertJsonPath('user.name', 'Reactivation Target');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Reactivation Target',
            'is_active' => true,
        ]);
    }
}
