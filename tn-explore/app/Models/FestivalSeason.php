<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FestivalSeason extends Model
{
    use HasFactory;

    protected $table = 'festivals_seasons';

    protected $fillable = [
        'name',
        'state_id',
        'district_id',
        'month_start',
        'month_end',
        'advisory_type',
        'description',
    ];

    protected $casts = [
        'month_start' => 'integer',
        'month_end' => 'integer',
    ];

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }
}
