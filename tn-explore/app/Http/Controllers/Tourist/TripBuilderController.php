<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\District;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TripBuilderController extends Controller
{
    /**
     * Display the Interactive Split-Screen "Toy to Travel" Trip Builder & Budget Calculator
     */
    public function index(Request $request): Response
    {
        $selectedDistrictId = $request->input('district_id');

        // Fetch all 38 districts with their places
        $districts = District::with(['places' => function ($q) {
            $q->orderBy('is_hidden_gem', 'desc')->orderBy('name');
        }])->orderBy('name')->get();

        // Default to first district (or Madurai if available) if none selected
        $initialDistrict = null;
        if ($selectedDistrictId) {
            $initialDistrict = $districts->firstWhere('id', $selectedDistrictId);
        }
        if (!$initialDistrict) {
            $initialDistrict = $districts->firstWhere('name', 'Madurai') ?? $districts->first();
        }

        return Inertia::render('Tourist/TripBuilder', [
            'districts' => $districts,
            'initialDistrictId' => $initialDistrict ? $initialDistrict->id : null,
        ]);
    }
}
