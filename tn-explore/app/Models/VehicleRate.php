<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'per_day_inr',
        'per_km_inr',
        'daily_min_km',
        'driver_allowance_per_day',
        'night_halt_inr',
        'extra_km_rate',
        'extra_hour_rate',
        'toll_parking_rule',
        'deposit_inr',
        'cancellation_rule',
    ];

    protected function casts(): array
    {
        return [
            'per_day_inr' => 'decimal:2',
            'per_km_inr' => 'decimal:2',
            'driver_allowance_per_day' => 'decimal:2',
            'night_halt_inr' => 'decimal:2',
            'extra_km_rate' => 'decimal:2',
            'extra_hour_rate' => 'decimal:2',
            'deposit_inr' => 'decimal:2',
            'daily_min_km' => 'integer',
        ];
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Calculate price estimate for a tourist trip.
     */
    public function calculateEstimate(float $totalKm, int $days, int $nights = 0): array
    {
        $minKmTotal = $days * $this->daily_min_km;
        $billableKm = max($totalKm, $minKmTotal);
        $kmCost = $billableKm * $this->per_km_inr;
        $driverCost = $days * $this->driver_allowance_per_day;
        $nightCost = $nights * $this->night_halt_inr;

        $basePerDayCost = $days * $this->per_day_inr;
        // Total is max of per-day package rate or km+driver rate
        $estimatedTotal = max($basePerDayCost, $kmCost) + $driverCost + $nightCost;

        return [
            'total_km' => $totalKm,
            'billable_km' => $billableKm,
            'days' => $days,
            'nights' => $nights,
            'km_cost' => round($kmCost, 2),
            'driver_allowance' => round($driverCost, 2),
            'night_halt_charge' => round($nightCost, 2),
            'estimated_total' => round($estimatedTotal, 2),
            'per_day_effective' => round($estimatedTotal / max(1, $days), 2),
            'toll_parking_note' => $this->toll_parking_rule,
            'cancellation_policy' => $this->cancellation_rule,
        ];
    }
}
