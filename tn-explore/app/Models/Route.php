<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    use HasFactory;

    protected $fillable = [
        'from_district_id',
        'to_district_id',
        'mode',
        'duration_mins',
        'cost',
        'distance_km',
        'operator',
        'notes',
    ];

    public function fromDistrict()
    {
        return $this->belongsTo(District::class, 'from_district_id');
    }

    public function toDistrict()
    {
        return $this->belongsTo(District::class, 'to_district_id');
    }
}
