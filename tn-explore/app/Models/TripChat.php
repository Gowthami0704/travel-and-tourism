<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TripChat extends Model
{
    use HasFactory;

    protected $fillable = [
        'custom_trip_id',
        'proposal_id',
        'tourist_id',
        'vendor_id',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function customTrip()
    {
        return $this->belongsTo(CustomTrip::class);
    }

    public function proposal()
    {
        return $this->belongsTo(TripProposal::class);
    }

    public function tourist()
    {
        return $this->belongsTo(User::class, 'tourist_id');
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function messages()
    {
        return $this->hasMany(TripMessage::class, 'chat_id')->orderBy('created_at', 'asc');
    }
}
