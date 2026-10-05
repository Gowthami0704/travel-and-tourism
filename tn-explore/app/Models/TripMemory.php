<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TripMemory extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'package_id',
        'booking_id',
        'tourist_id',
        'trip_date',
        'title',
        'description',
        'place_ids',
        'is_traveller_story',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'trip_date' => 'date',
            'place_ids' => 'array',
            'is_traveller_story' => 'boolean',
        ];
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function package()
    {
        return $this->belongsTo(Listing::class, 'package_id');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function tourist()
    {
        return $this->belongsTo(User::class, 'tourist_id');
    }

    public function media()
    {
        return $this->morphMany(VendorMedia::class, 'mediable')->orderBy('sort_order');
    }

    public function approvedMedia()
    {
        return $this->morphMany(VendorMedia::class, 'mediable')->where('status', 'approved')->orderBy('sort_order');
    }
}
