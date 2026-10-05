<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TripProposal extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_trip_id',
        'vendor_id',
        'quote_price',
        'inclusions',
        'exclusions',
        'itinerary_summary',
        'vendor_message',
        'valid_until',
        'status',
    ];

    protected $casts = [
        'quote_price' => 'decimal:2',
        'inclusions' => 'array',
        'exclusions' => 'array',
        'valid_until' => 'datetime',
    ];

    public function customTrip()
    {
        return $this->belongsTo(CustomTrip::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function chat()
    {
        return $this->hasOne(TripChat::class, 'proposal_id');
    }
}
