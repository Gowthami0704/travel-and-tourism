<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\District;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TripMatesController extends Controller
{
    /**
     * Display the Trip Mates Hub social companion portal
     */
    public function index(Request $request): Response
    {
        $districts = District::orderBy('name')->get(['id', 'name', 'region', 'hero_image_url']);

        return Inertia::render('Tourist/TripMates', [
            'districts' => $districts,
        ]);
    }
}
