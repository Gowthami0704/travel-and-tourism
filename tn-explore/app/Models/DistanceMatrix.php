<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DistanceMatrix extends Model
{
    use HasFactory;

    protected $table = 'distance_matrix';

    protected $fillable = [
        'from_place_id',
        'to_place_id',
        'km',
        'minutes',
    ];

    protected $casts = [
        'km' => 'float',
        'minutes' => 'integer',
    ];

    public function fromPlace()
    {
        return $this->belongsTo(Place::class, 'from_place_id');
    }

    public function toPlace()
    {
        return $this->belongsTo(Place::class, 'to_place_id');
    }
}
