<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'district_id',
        'type',
        'make_model',
        'year',
        'seats',
        'luggage_bags',
        'fuel_type',
        'ac',
        'with_driver',
        'driver_languages',
        'features',
        'description',
        'status',
        'rejection_reason',
        'baseline_approved_price',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'ac' => 'boolean',
            'with_driver' => 'boolean',
            'is_active' => 'boolean',
            'year' => 'integer',
            'seats' => 'integer',
            'luggage_bags' => 'integer',
            'driver_languages' => 'array',
            'features' => 'array',
            'baseline_approved_price' => 'decimal:2',
        ];
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function rates()
    {
        return $this->hasOne(VehicleRate::class);
    }

    public function documents()
    {
        return $this->hasOne(VehicleDocument::class);
    }

    public function blockedDates()
    {
        return $this->hasMany(VehicleBlockedDate::class);
    }

    public function media()
    {
        return $this->morphMany(VendorMedia::class, 'mediable')->orderBy('sort_order');
    }

    public function approvedMedia()
    {
        return $this->morphMany(VendorMedia::class, 'mediable')->where('status', 'approved')->orderBy('sort_order');
    }

    public function isAvailableForDates(string $startDate, string $endDate): bool
    {
        return !$this->blockedDates()
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                      ->orWhereBetween('end_date', [$startDate, $endDate])
                      ->orWhere(function ($q) use ($startDate, $endDate) {
                          $q->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                      });
            })->exists();
    }

    public function isInsuranceExpired(): bool
    {
        $docs = $this->documents;
        if (!$docs || empty($docs->insurance_expiry_date)) {
            return false;
        }
        return now()->isAfter($docs->insurance_expiry_date);
    }

    public function isPermitExpired(): bool
    {
        $docs = $this->documents;
        if (!$docs || empty($docs->permit_expiry_date)) {
            return false;
        }
        return now()->isAfter($docs->permit_expiry_date);
    }

    public function isReadyForPublic(): bool
    {
        return $this->is_active && 
               $this->status === 'approved' && 
               !$this->isInsuranceExpired() && 
               !$this->isPermitExpired();
    }
}
