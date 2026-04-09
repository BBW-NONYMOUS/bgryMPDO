<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Requests\Auth\UpdateProfilePhotoRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function __construct(
        private readonly ActivityLogService $activityLogService,
    ) {
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $user->fill($request->validated())->save();

        $this->activityLogService->log(
            action: 'profile.updated',
            module: 'profile',
            description: "{$user->name} updated their profile details.",
            user: $user,
            request: $request,
        );

        $user->loadMissing('barangay');

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => UserResource::make($user)->resolve(),
        ]);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! Hash::check($request->string('current_password')->toString(), $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
                'errors' => [
                    'current_password' => ['Current password is incorrect.'],
                ],
            ], 422);
        }

        $user->forceFill([
            'password' => $request->string('password')->toString(),
        ])->save();

        $this->activityLogService->log(
            action: 'profile.password_changed',
            module: 'profile',
            description: "{$user->name} changed their password.",
            user: $user,
            request: $request,
        );

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }

    public function updatePhoto(UpdateProfilePhotoRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $diskName = (string) config('mpdo.avatars_disk', 'public');
        $disk = Storage::disk($diskName);

        $file = $request->file('photo');
        $path = $file->store('avatars', $diskName);

        $oldPath = $user->profile_photo_path;

        $user->forceFill([
            'profile_photo_path' => $path,
        ])->save();

        if ($oldPath && $disk->exists($oldPath)) {
            $disk->delete($oldPath);
        }

        $this->activityLogService->log(
            action: 'profile.photo_updated',
            module: 'profile',
            description: "{$user->name} updated their profile photo.",
            user: $user,
            request: $request,
        );

        $user->loadMissing('barangay');

        return response()->json([
            'message' => 'Profile photo updated successfully.',
            'user' => UserResource::make($user)->resolve(),
        ]);
    }
}

