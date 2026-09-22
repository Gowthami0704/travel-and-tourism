<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'admin_name',
        'action',
        'target_type',
        'target_id',
        'reason',
        'ip_address',
    ];

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public static function log(string $action, string $targetType, $targetId = null, ?string $reason = null): self
    {
        $user = auth()->user();
        return self::create([
            'admin_id' => $user ? $user->id : null,
            'admin_name' => $user ? $user->name : 'System Admin',
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => (string)$targetId,
            'reason' => $reason,
            'ip_address' => request()->ip(),
        ]);
    }
}
