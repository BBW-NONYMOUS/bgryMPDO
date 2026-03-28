<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    public const ACCESS_ADMIN = 'admin';

    public const ACCESS_STAFF = 'staff';

    public const ACCESS_BARANGAY = 'barangay';

    public const STATUS_DRAFT = 'draft';

    public const STATUS_ACTIVE = 'active';

    public const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'title',
        'document_number',
        'description',
        'file_name',
        'original_file_name',
        'file_path',
        'file_type',
        'file_size',
        'category_id',
        'barangay_id',
        'uploaded_by',
        'document_date',
        'keywords',
        'remarks',
        'access_level',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'document_date' => 'date',
            'file_size' => 'integer',
        ];
    }

    public static function allowedAccessLevels(): array
    {
        return [
            self::ACCESS_ADMIN,
            self::ACCESS_STAFF,
            self::ACCESS_BARANGAY,
        ];
    }

    public static function allowedStatuses(): array
    {
        return [
            self::STATUS_DRAFT,
            self::STATUS_ACTIVE,
            self::STATUS_ARCHIVED,
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->isAdmin()) {
            return $query;
        }

        if ($user->isStaff()) {
            return $query->whereIn('access_level', [
                self::ACCESS_STAFF,
                self::ACCESS_BARANGAY,
            ]);
        }

        return $query
            ->where('access_level', self::ACCESS_BARANGAY)
            ->where(function (Builder $builder) use ($user): void {
                $builder
                    ->whereNull('barangay_id')
                    ->orWhere('barangay_id', $user->barangay_id);
            });
    }

    public function scopeFilter(Builder $query, array $filters): Builder
    {
        $search = $filters['search'] ?? null;

        if ($search) {
            $query->where(function (Builder $builder) use ($search): void {
                $builder
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('document_number', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('keywords', 'like', "%{$search}%");
            });
        }

        $query
            ->when($filters['category_id'] ?? null, fn (Builder $builder, mixed $value) => $builder->where('category_id', $value))
            ->when($filters['barangay_id'] ?? null, fn (Builder $builder, mixed $value) => $builder->where('barangay_id', $value))
            ->when($filters['uploaded_by'] ?? null, fn (Builder $builder, mixed $value) => $builder->where('uploaded_by', $value))
            ->when($filters['status'] ?? null, fn (Builder $builder, mixed $value) => $builder->where('status', $value))
            ->when($filters['date_from'] ?? null, fn (Builder $builder, mixed $value) => $builder->whereDate('document_date', '>=', $value))
            ->when($filters['date_to'] ?? null, fn (Builder $builder, mixed $value) => $builder->whereDate('document_date', '<=', $value));

        return match ($filters['sort'] ?? 'latest') {
            'oldest' => $query->orderBy('created_at'),
            'title' => $query->orderBy('title'),
            default => $query->orderByDesc('created_at'),
        };
    }
}
