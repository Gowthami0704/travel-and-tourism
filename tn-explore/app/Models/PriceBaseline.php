<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PriceBaseline extends Model
{
    use HasFactory;

    protected $fillable = [
        'state_id',
        'district_id',
        'category',
        'unit',
        'amount',
    ];

    protected $casts = [
        'amount' => 'float',
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
