<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Vehicle;
use App\Models\VehicleRate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleController extends Controller
{
    /**
     * Public Fleet Catalogue
     */
    public function index(Request $request): Response
    {
        $query = Vehicle::with(['vendor', 'district', 'rates', 'approvedMedia'])
            ->where('is_active', true)
            ->where('status', 'approved');

        // Filters
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('district_id')) {
            $query->where('district_id', $request->district_id);
        }

        if ($request->filled('seats')) {
            $query->where('seats', '>=', (int) $request->seats);
        }

        if ($request->has('ac') && $request->ac !== '') {
            $query->where('ac', $request->boolean('ac'));
        }

        if ($request->has('with_driver') && $request->with_driver !== '') {
            $query->where('with_driver', $request->boolean('with_driver'));
        }

        // Sorting
        $sort = $request->input('sort', 'popular');
        if ($sort === 'price_asc') {
            $query->join('vehicle_rates', 'vehicles.id', '=', 'vehicle_rates.vehicle_id')
                  ->orderBy('vehicle_rates.per_day_inr', 'asc')
                  ->select('vehicles.*');
        } elseif ($sort === 'seats_desc') {
            $query->orderBy('seats', 'desc');
        } else {
            $query->latest();
        }

        $vehicles = $query->paginate(12)->withQueryString();
        $districts = District::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Tourist/Vehicles/Index', [
            'vehicles' => $vehicles,
            'districts' => $districts,
            'filters' => $request->only(['type', 'district_id', 'seats', 'ac', 'with_driver', 'sort']),
        ]);
    }

    /**
     * Public Vehicle Details Page
     */
    public function show(int $id): Response
    {
        $vehicle = Vehicle::with([
            'vendor',
            'district',
            'rates',
            'blockedDates',
            'approvedMedia.place'
        ])->where('is_active', true)
          ->where('status', 'approved')
          ->findOrFail($id);

        // Security check: Never expose raw registration number or driver private phone to unbooked public
        $safeVehicle = $vehicle->toArray();
        if (isset($safeVehicle['documents'])) {
            unset($safeVehicle['documents']['registration_number']);
            unset($safeVehicle['documents']['driver_phone']);
        }

        // Other vehicles from same vendor or district
        $similarVehicles = Vehicle::with(['vendor', 'rates', 'approvedMedia'])
            ->where('id', '!=', $vehicle->id)
            ->where('is_active', true)
            ->where('status', 'approved')
            ->where(function ($q) use ($vehicle) {
                $q->where('district_id', $vehicle->district_id)
                  ->orWhere('vendor_id', $vehicle->vendor_id);
            })
            ->take(3)
            ->get();

        return Inertia::render('Tourist/Vehicles/Show', [
            'vehicle' => $safeVehicle,
            'similarVehicles' => $similarVehicles,
        ]);
    }

    /**
     * Live Vehicle Rate Estimator API
     */
    public function estimate(Request $request, int $id): JsonResponse
    {
        $vehicle = Vehicle::with('rates')->findOrFail($id);
        $rate = $vehicle->rates;

        if (!$rate) {
            return response()->json(['error' => 'Rate card not configured for this vehicle'], 404);
        }

        $km = (float) $request->input('km', 300);
        $days = max(1, (int) $request->input('days', 1));
        $nights = max(0, (int) $request->input('nights', max(0, $days - 1)));

        $breakdown = $rate->calculateEstimate($km, $days, $nights);

        // Calculate fair-price anomaly badge
        $baselinePerKm = 14.50;
        $actualPerKm = $breakdown['estimated_total'] / max(1, $breakdown['billable_km']);
        $isFairPrice = $actualPerKm >= ($baselinePerKm * 0.80) && $actualPerKm <= ($baselinePerKm * 1.40);

        return response()->json([
            'success' => true,
            'estimate' => $breakdown,
            'is_fair_price' => $isFairPrice,
            'fair_price_badge' => $isFairPrice ? 'Fair Price Verified ✓' : 'Custom Tariff',
        ]);
    }
}
