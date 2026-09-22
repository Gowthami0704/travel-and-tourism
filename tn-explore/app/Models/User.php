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
        'password',
        'role',
        'admin_role',
        'is_banned',
        'phone',
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
        ];
    }

    public function isTourist(): bool
    {
        return in_array($this->role, ['tourist', 'user']);
    }

    public function isVendor(): bool
    {
        return $this->role === 'vendor';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin' || !empty($this->admin_role);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'admin' && ($this->admin_role === 'super_admin' || empty($this->admin_role));
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
}

