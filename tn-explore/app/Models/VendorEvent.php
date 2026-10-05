<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'type',
        'payload',
        'device_hash',
        'ip_address',
        'created_at',
    ];

    public $timestamps = false;

    protected $casts = [
        'payload' => 'array',
        'created_at' => 'datetime',
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }
}
