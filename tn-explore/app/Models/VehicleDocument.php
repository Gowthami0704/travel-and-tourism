<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'registration_number',
        'driver_name',
        'driver_phone',
        'driver_photo_path',
        'rc_document_path',
        'insurance_document_path',
        'insurance_expiry_date',
        'permit_document_path',
        'permit_expiry_date',
        'fitness_expiry_date',
        'is_verified',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'insurance_expiry_date' => 'date',
            'permit_expiry_date' => 'date',
            'fitness_expiry_date' => 'date',
            'is_verified' => 'boolean',
            'verified_at' => 'datetime',
        ];
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
