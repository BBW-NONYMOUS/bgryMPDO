<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private readonly ActivityLogService $activityLogService,
    ) {
    }

    /**
     * @throws ValidationException
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()
            ->with('barangay')
            ->where('email', $request->string('email')->toString())
            ->first();

        if (! $user || ! Hash::check($request->string('password')->toString(), $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'The provided credentials are incorrect.',
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => 'This account is inactive.',
            ]);
        }

        if (! $user->isApproved()) {
            $message = match ($user->account_status) {
                User::ACCOUNT_PENDING => 'This account is pending approval.',
                User::ACCOUNT_REJECTED => 'This account has been rejected.',
                default => 'This account is not approved.',
            };

            throw ValidationException::withMessages([
                'email' => $message,
            ]);
        }

        $token = $user->createToken('mpdo-api')->plainTextToken;

        $this->activityLogService->log(
            action: 'auth.login',
            module: 'auth',
            description: "{$user->name} signed in.",
            user: $user,
            request: $request,
        );

        return response()->json([
            'token' => $token,
            'user' => UserResource::make($user)->resolve(),
        ]);
    }

    public function profile(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $user->loadMissing('barangay');

        return response()->json([
            'user' => UserResource::make($user)->resolve(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user) {
            $this->activityLogService->log(
                action: 'auth.logout',
                module: 'auth',
                description: "{$user->name} signed out.",
                user: $user,
                request: $request,
            );
        }

        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
