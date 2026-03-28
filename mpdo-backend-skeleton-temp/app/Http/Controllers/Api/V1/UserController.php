<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $perPage = max(1, min((int) $request->integer('per_page', 15), 100));

        $users = User::query()
            ->with('barangay')
            ->withCount('uploadedDocuments')
            ->search($request->string('search')->toString())
            ->when($request->filled('role'), fn ($query) => $query->where('role', User::normalizeRole($request->string('role')->toString())))
            ->when($request->filled('is_active'), fn ($query) => $query->where('is_active', $request->boolean('is_active')))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return UserResource::collection($users);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['username'] = $this->generateUniqueUsername($data['email']);
        $data['is_active'] = $request->boolean('is_active', true);
        $data['barangay_id'] = $this->normalizeBarangayAssignment($data['role'], $data['barangay_id'] ?? null);

        $user = User::create($data);
        $user->load('barangay')->loadCount('uploadedDocuments');

        return response()->json([
            'message' => 'User created successfully.',
            'user' => UserResource::make($user)->resolve(),
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        $user->load('barangay')->loadCount('uploadedDocuments');

        return response()->json([
            'user' => UserResource::make($user)->resolve(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }

        $data['is_active'] = $request->boolean('is_active', $user->is_active);
        $data['barangay_id'] = $this->normalizeBarangayAssignment($data['role'], $data['barangay_id'] ?? null);

        $user->fill($data)->save();
        $user->load('barangay')->loadCount('uploadedDocuments');

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => UserResource::make($user)->resolve(),
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()?->is($user)) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }

    private function normalizeBarangayAssignment(string $role, mixed $barangayId): mixed
    {
        return User::normalizeRole($role) === User::ROLE_BARANGAY_OFFICIAL
            ? $barangayId
            : null;
    }

    private function generateUniqueUsername(string $email): string
    {
        $localPart = Str::lower(Str::before($email, '@'));
        $base = preg_replace('/[^a-z0-9]+/', '_', $localPart) ?? '';
        $base = trim($base, '_');
        $base = $base !== '' ? $base : 'user';
        $base = Str::limit($base, 40, '');

        $username = $base;
        $counter = 1;

        while (User::query()->where('username', $username)->exists()) {
            $suffix = '_'.$counter;
            $username = Str::limit($base, 40 - strlen($suffix), '').$suffix;
            $counter++;
        }

        return $username;
    }
}
