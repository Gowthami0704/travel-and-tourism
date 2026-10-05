<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use App\Models\Vehicle;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckVehicleExpiryCommand extends Command
{
    protected $signature = 'vehicles:check-expiry';
    protected $description = 'Audit vehicle insurance and permits; automatically take offline expired fleet records';

    public function handle(): int
    {
        $this->info('Auditing fleet vehicle documents and expiry dates...');

        $vehicles = Vehicle::with('documents')->where('is_active', true)->get();
        $expiredCount = 0;

        foreach ($vehicles as $vehicle) {
            $docs = $vehicle->documents;
            if (!$docs) continue;

            $isInsuranceExpired = !empty($docs->insurance_expiry_date) && now()->isAfter($docs->insurance_expiry_date);
            $isPermitExpired = !empty($docs->permit_expiry_date) && now()->isAfter($docs->permit_expiry_date);

            if ($isInsuranceExpired || $isPermitExpired) {
                $reason = $isInsuranceExpired ? 'Expired Insurance Policy' : 'Expired Road Permit';
                $vehicle->update([
                    'is_active' => false,
                    'status' => 'offline',
                    'rejection_reason' => "Automatically taken offline due to {$reason}.",
                ]);

                $expiredCount++;
                Log::warning("VEHICLE_OFFLINE: Vehicle #{$vehicle->id} ({$vehicle->make_model}) taken offline due to {$reason}.");

                AuditLog::log(
                    'vehicle_auto_offline_expiry',
                    'vehicle',
                    $vehicle->id,
                    "Vehicle #{$vehicle->id} automatically taken offline due to {$reason}."
                );
            }
        }

        $this->info("Audit complete. {$expiredCount} expired vehicles taken offline safely.");
        return 0;
    }
}
