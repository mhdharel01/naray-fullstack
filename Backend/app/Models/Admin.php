<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Authenticatable
{
    use HasApiTokens, SoftDeletes;

    const ROLE_SUPER_ADMIN = 'super_admin';
    const ROLE_ADMIN = 'admin'; // Operasional (Dokter, Jadwal, Kamar, Poli)
    const ROLE_MARKETING = 'marketing'; // Marketing (MCU, Artikel, Galeri, Video, Banners)

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'password' => 'hashed',
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
    ];

    protected $appends = [
        'role_label',
    ];

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isOperasional(): bool
    {
        return $this->role === self::ROLE_ADMIN || $this->role === 'operasional';
    }

    public function isMarketing(): bool
    {
        return $this->role === self::ROLE_MARKETING;
    }

    public function hasRole($roles): bool
    {
        if ($this->isSuperAdmin()) {
            return true; // Super admin always has full privileges
        }
        if (is_string($roles)) {
            $roles = array_map('trim', explode(',', $roles));
        }
        return in_array($this->role, $roles);
    }

    public function getRoleLabelAttribute(): string
    {
        return match ($this->role) {
            self::ROLE_SUPER_ADMIN => 'Super Admin',
            self::ROLE_MARKETING => 'Marketing & MCU',
            default => 'Admin Operasional',
        };
    }

    public function media()
    {
        return $this->hasMany(Media::class, 'uploaded_by');
    }
}