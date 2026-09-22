<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Place extends Model
{
    use HasFactory;

    protected $fillable = [
        'district_id',
        'name',
        'wiki_title',
        'category',
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
    ];

    public function district()
    {
        return $this->belongsTo(District::class);
    }
}
