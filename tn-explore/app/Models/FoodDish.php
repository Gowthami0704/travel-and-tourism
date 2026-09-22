<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FoodDish extends Model
{
    use HasFactory;

    protected $fillable = [
        'district_id',
        'name',
        'wiki_title',
        'description',
        'image_url',
        'where_to_try',
    ];

    public function district()
    {
        return $this->belongsTo(District::class);
    }
}
