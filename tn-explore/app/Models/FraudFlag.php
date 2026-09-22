<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FraudFlag extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'reason',
        'severity',
        'resolved',
    ];

    protected $casts = [
        'resolved' => 'boolean',
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }
}
