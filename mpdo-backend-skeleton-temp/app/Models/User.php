<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_ADMIN = 'admin';

    public const ROLE_STAFF = 'staff';

    public const ROLE_BARANGAY_OFFICIAL = 'barangay_official';

    public const ROLE_BARANGAY_ALIAS = 'barangay';

    protected $fillable = [
        'name',
        'email',
        'username',
        'password',
        'role',
        'is_active',
        'barangay_id',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_active' => 'boolean',
            'password' => 'hashed',
        ];
    }

    protected function role(): Attribute
    {
        return Attribute::make(
            set: static fn (?string $value) => self::normalizeRole($value),
        );
    }

    public static function allowedRoles(): array
    {
        return [
            self::ROLE_ADMIN,
            self::ROLE_STAFF,
            self::ROLE_BARANGAY_OFFICIAL,
            self::ROLE_BARANGAY_ALIAS,
        ];
    }

    public static function normalizeRole(?string $role): ?string
    {
        return $role === self::ROLE_BARANGAY_ALIAS
            ? self::ROLE_BARANGAY_OFFICIAL
            : $role;
    }

    public static function roleForApi(?string $role): ?string
    {
        return self::normalizeRole($role) === self::ROLE_BARANGAY_OFFICIAL
            ? self::ROLE_BARANGAY_ALIAS
            : $role;
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function uploadedDocuments(): HasMany
    {
        return $this->hasMany(Document::class, 'uploaded_by');
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (! $search) {
            return $query;
        }

        return $query->where(function (Builder $builder) use ($search): void {
            $builder
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
                ->orWhere('username', 'like', "%{$search}%");
        });
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isStaff(): bool
    {
        return $this->role === self::ROLE_STAFF;
    }

    public function isBarangayOfficial(): bool
    {
        return self::normalizeRole($this->role) === self::ROLE_BARANGAY_OFFICIAL;
    }
}
