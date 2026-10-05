<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomTripLeg extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_trip_id',
        'leg_order',
        'district_id',
        'from_location',
        'to_location',
        'leg_date',
        'pickup_time',
        'assigned_vendor_id',
        'cost',
        'status',
    ];

    protected $casts = [
        'leg_date' => 'date',
        'cost' => 'decimal:2',
    ];

    public function customTrip()
    {
        return $this->belongsTo(CustomTrip::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class, 'assigned_vendor_id');
    }
}
