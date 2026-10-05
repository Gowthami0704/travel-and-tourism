<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuickEnquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'city',
        'destination_district_id',
        'travel_date',
        'people_count',
        'trip_type',
        'status',
    ];

    protected $casts = [
        'travel_date' => 'date',
    ];

    public function destinationDistrict()
    {
        return $this->belongsTo(District::class, 'destination_district_id');
    }
}
