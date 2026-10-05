<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackageDeparture extends Model
{
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'departure_date',
        'total_seats',
        'seats_left',
        'status',
    ];

    protected $casts = [
        'departure_date' => 'date',
    ];

    public function listing()
    {
        return $this->belongsTo(Listing::class);
    }

    public function isSoldOut(): bool
    {
        return $this->seats_left <= 0 || $this->status === 'sold_out';
    }
}
