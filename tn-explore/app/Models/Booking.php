<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'tourist_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'listing_id',
        'start_date',
        'end_date',
        'travelers',
        'special_requests',
        'total_amount',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'travelers' => 'integer',
        'total_amount' => 'integer',
    ];

    public function tourist()
    {
        return $this->belongsTo(User::class, 'tourist_id');
    }

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }
}

