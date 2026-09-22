<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Listing extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'title',
        'description',
        'type',
        'price',
        'image_url',
        'images',
        'details',
        'status',
        'is_active',
    ];

    protected $casts = [
        'details' => 'array',
        'images' => 'array',
        'is_active' => 'boolean',
        'price' => 'integer',
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function scopePublished($query)
    {
        return $query->where('is_active', true)->where('status', '!=', 'draft');
    }
}

