<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VerificationMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'sender_id',
        'sender_role',
        'type',
        'checklist_items',
        'note',
        'deadline_at',
        'diff',
    ];

    protected $casts = [
        'checklist_items' => 'array',
        'diff' => 'array',
        'deadline_at' => 'datetime',
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
