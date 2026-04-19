<?php

namespace Tests\Feature\Api;

use App\Models\Barangay;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_barangay_user_login_returns_frontend_role_alias_and_profile_data(): void
    {
        $barangay = Barangay::query()->create([
            'name' => 'Poblacion',
            'code' => 'POB',
            'is_active' => true,
        ]);

        User::factory()->create([
            'name' => 'Barangay Official',
            'email' => 'barangay@mpdo.local',
            'username' => 'barangay',
            'password' => Hash::make('password123'),
            'role' => User::ROLE_BARANGAY_OFFICIAL,
            'barangay_id' => $barangay->id,
            'is_active' => true,
            'account_status' => User::ACCOUNT_APPROVED,
        ]);

        $loginResponse = $this->postJson('/api/v1/auth/login', [
            'email' => 'barangay@mpdo.local',
            'password' => 'password123',
        ]);

        $loginResponse
            ->assertOk()
            ->assertJsonPath('user.role', User::ROLE_BARANGAY_ALIAS)
            ->assertJsonPath('user.barangay.name', 'Poblacion');

        $profileResponse = $this
            ->withHeader('Authorization', 'Bearer '.$loginResponse->json('token'))
            ->getJson('/api/v1/auth/profile');

        $profileResponse
            ->assertOk()
            ->assertJsonPath('user.email', 'barangay@mpdo.local')
            ->assertJsonPath('user.role', User::ROLE_BARANGAY_ALIAS);
    }

    public function test_pending_account_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'pending@mpdo.local',
            'password' => Hash::make('password123'),
            'is_active' => true,
            'account_status' => User::ACCOUNT_PENDING,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'pending@mpdo.local',
            'password' => 'password123',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'This account is pending approval.');
    }
}
