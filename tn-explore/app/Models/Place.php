<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Place extends Model
{
    use HasFactory;

    protected $fillable = [
        'state_id',
        'district_id',
        'name',
        'wiki_title',
        'category',
        'typical_visit_hours',
        'entry_fee',
        'opening_days',
        'best_season',
        'description',
        'image_url',
        'wiki_url',
        'latitude',
        'longitude',
        'is_hidden_gem',
    ];

    protected $casts = [
        'is_hidden_gem' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
        'typical_visit_hours' => 'float',
        'entry_fee' => 'float',
    ];

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function images()
    {
        return $this->hasMany(PlaceImage::class);
    }

    public function approvedImages()
    {
        return $this->hasMany(PlaceImage::class)->where('is_approved', true);
    }
}
