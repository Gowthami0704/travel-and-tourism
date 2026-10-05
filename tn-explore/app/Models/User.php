<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'email_verified_at',
        'password',
        'role',
        'admin_role',
        'assigned_district_ids',
        'is_banned',
        'phone',
        'theme_preference',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
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
            'password' => 'hashed',
            'is_banned' => 'boolean',
            'assigned_district_ids' => 'array',
        ];
    }

    public function isTourist(): bool
    {
        return in_array($this->role, ['tourist', 'user', 'guest']);
    }

    public function isVendor(): bool
    {
        return $this->role === 'vendor';
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'super_admin', 'district_admin']) || !empty($this->admin_role);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin' || 
               ($this->role === 'admin' && ($this->admin_role === 'super_admin' || empty($this->admin_role)));
    }

    public function isDistrictAdmin(): bool
    {
        return $this->role === 'district_admin' || $this->admin_role === 'district_admin';
    }

    public function canManageDistrict(int $districtId): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if ($this->isDistrictAdmin()) {
            $assigned = $this->assigned_district_ids ?: [];
            return in_array($districtId, $assigned);
        }

        return false;
    }

    public function isModerator(): bool
    {
        return $this->admin_role === 'moderator';
    }

    public function vendor()
    {
        return $this->hasOne(Vendor::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'tourist_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'tourist_id');
    }

    public function customTrips()
    {
        return $this->hasMany(CustomTrip::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AdminAuditLog::class, 'admin_id');
    }
}
