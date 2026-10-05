<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'mediable_type',
        'mediable_id',
        'path',
        'thumb_path',
        'medium_path',
        'alt_text',
        'caption',
        'taken_at',
        'place_id',
        'status',
        'reject_reason',
        'phash',
        'width',
        'height',
        'file_size_bytes',
        'sort_order',
        'is_verified_traveller_memory',
        'tourist_id',
    ];

    protected function casts(): array
    {
        return [
            'taken_at' => 'date',
            'is_verified_traveller_memory' => 'boolean',
            'sort_order' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
            'file_size_bytes' => 'integer',
        ];
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function place()
    {
        return $this->belongsTo(Place::class);
    }

    public function tourist()
    {
        return $this->belongsTo(User::class, 'tourist_id');
    }

    public function mediable()
    {
        return $this->morphTo();
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }
}
