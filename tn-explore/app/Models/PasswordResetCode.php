<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PasswordResetCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'code_hash',
        'attempts',
        'expires_at',
        'resend_available_at',
        'verified_at',
        'reset_token',
        'reset_token_expires_at',
        'portal',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'resend_available_at' => 'datetime',
            'verified_at' => 'datetime',
            'reset_token_expires_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }

    public function isExpired(): bool
    {
        return now()->isAfter($this->expires_at);
    }

    public function isResetTokenExpired(): bool
    {
        return empty($this->reset_token_expires_at) || now()->isAfter($this->reset_token_expires_at);
    }

    public function hasExceededMaxAttempts(): bool
    {
        return $this->attempts >= 5;
    }
}
