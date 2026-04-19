<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function __construct(
        private readonly ActivityLogService $activityLogService,
    ) {
    }

    public function index(Request $request)
    {
        $perPage = max(1, min((int) $request->integer('per_page', 15), 100));

        $users = User::query()
            ->with('barangay')
            ->withCount('uploadedDocuments')
            ->search($request->string('search')->toString())
            ->when($request->filled('role'), fn ($query) => $query->where('role', User::normalizeRole($request->string('role')->toString())))
            ->when($request->filled('is_active'), fn ($query) => $query->where('is_active', $request->boolean('is_active')))
            ->when($request->filled('account_status'), fn ($query) => $query->where('account_status', $request->string('account_status')->toString()))
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

        $data['account_status'] = $data['account_status'] ?? User::ACCOUNT_PENDING;
        $data['account_status_updated_by'] = $request->user()?->id;
        $data['account_status_updated_at'] = now();

        $user = User::create($data);
        $user->load('barangay')->loadCount('uploadedDocuments');

        $this->activityLogService->log(
            action: 'user.created',
            module: 'users',
            description: "Created user {$user->name}.",
            user: $request->user(),
            details: ['created_user_id' => $user->id],
            request: $request,
        );

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

        if (array_key_exists('account_status', $data) && $data['account_status'] !== $user->account_status) {
            $data['account_status_updated_by'] = $request->user()?->id;
            $data['account_status_updated_at'] = now();
        }

        $user->fill($data)->save();
        $user->load('barangay')->loadCount('uploadedDocuments');

        $this->activityLogService->log(
            action: 'user.updated',
            module: 'users',
            description: "Updated user {$user->name}.",
            user: $request->user(),
            details: ['updated_user_id' => $user->id],
            request: $request,
        );

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => UserResource::make($user)->resolve(),
        ]);
    }

    public function approve(Request $request, User $user): JsonResponse
    {
        if ($request->user()?->is($user)) {
            return response()->json([
                'message' => 'You cannot approve your own account.',
            ], 422);
        }

        $validated = $request->validate([
            'remark' => ['nullable', 'string'],
        ]);

        $user->forceFill([
            'account_status' => User::ACCOUNT_APPROVED,
            'account_status_remark' => $validated['remark'] ?? null,
            'account_status_updated_by' => $request->user()?->id,
            'account_status_updated_at' => now(),
        ])->save();

        $this->activityLogService->log(
            action: 'user.approved',
            module: 'users',
            description: "Approved user {$user->name}.",
            user: $request->user(),
            details: [
                'approved_user_id' => $user->id,
                'remark' => $validated['remark'] ?? null,
            ],
            request: $request,
        );

        $user->load('barangay')->loadCount('uploadedDocuments');

        return response()->json([
            'message' => 'User approved successfully.',
            'user' => UserResource::make($user)->resolve(),
        ]);
    }

    public function reject(Request $request, User $user): JsonResponse
    {
        if ($request->user()?->is($user)) {
            return response()->json([
                'message' => 'You cannot reject your own account.',
            ], 422);
        }

        $validated = $request->validate([
            'remark' => ['nullable', 'string'],
        ]);

        $user->forceFill([
            'account_status' => User::ACCOUNT_REJECTED,
            'account_status_remark' => $validated['remark'] ?? null,
            'account_status_updated_by' => $request->user()?->id,
            'account_status_updated_at' => now(),
        ])->save();

        $this->activityLogService->log(
            action: 'user.rejected',
            module: 'users',
            description: "Rejected user {$user->name}.",
            user: $request->user(),
            details: [
                'rejected_user_id' => $user->id,
                'remark' => $validated['remark'] ?? null,
            ],
            request: $request,
        );

        $user->load('barangay')->loadCount('uploadedDocuments');

        return response()->json([
            'message' => 'User rejected successfully.',
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

        $this->activityLogService->log(
            action: 'user.deleted',
            module: 'users',
            description: "Deleted user {$user->name}.",
            user: $request->user(),
            details: ['deleted_user_id' => $user->id],
            request: $request,
        );

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
