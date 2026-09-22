<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class District extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'hero_image_url',
        'wiki_title',
        'region',
        'best_season',
    ];

    public function places()
    {
        return $this->hasMany(Place::class);
    }

    public function foodDishes()
    {
        return $this->hasMany(FoodDish::class);
    }

    public function routesFrom()
    {
        return $this->hasMany(Route::class, 'from_district_id');
    }

    public function routesTo()
    {
        return $this->hasMany(Route::class, 'to_district_id');
    }

    public function vendors()
    {
        return $this->hasMany(Vendor::class);
    }
}
