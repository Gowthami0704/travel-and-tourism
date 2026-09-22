<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Listing;
use App\Models\Place;
use App\Models\Route;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DistrictController extends Controller
{
    /**
     * Display the main landing page with 38 districts grid, search, and region filters.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $region = $request->input('region');

        $query = District::query()->withCount([
            'places',
            'places as hidden_gems_count' => function ($q) {
                $q->where('is_hidden_gem', true);
            },
            'foodDishes',
            'vendors' => function ($q) {
                $q->where('status', 'active');
            }
        ]);

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
        }

        if ($region && $region !== 'All') {
            $query->where('region', $region);
        }

        $districts = $query->orderBy('name')->get();

        // Regions list for filter tabs
        $regions = ['All', 'North', 'South', 'Kongu', 'Central', 'Coastal'];

        // Featured hidden gems across Tamil Nadu for the showcase ticker
        $featuredGems = Place::where('is_hidden_gem', true)
            ->with('district:id,name,region,hero_image_url')
            ->inRandomOrder()
            ->limit(6)
            ->get();

        return Inertia::render('Tourist/Home', [
            'districts' => $districts,
            'regions' => $regions,
            'filters' => [
                'search' => $search,
                'region' => $region ?? 'All',
            ],
            'featuredGems' => $featuredGems,
        ]);
    }

    /**
     * Display the district detail page with all 5 tabs.
     */
    public function show($id): Response
    {
        $district = District::with([
            'places' => function ($q) {
                $q->orderBy('is_hidden_gem', 'desc')->orderBy('name');
            },
            'foodDishes',
            'vendors' => function ($q) {
                $q->where('status', 'active')->with(['listings' => function ($l) {
                    $l->where('is_active', true);
                }, 'reviews']);
            },
            'routesFrom.toDistrict',
            'routesTo.fromDistrict',
        ])->findOrFail($id);

        // Calculate other districts for transit comparison dropdown
        $allDistricts = District::where('id', '!=', $id)->orderBy('name')->get(['id', 'name']);

        // Collect all active routes connected to this district
        $routes = Route::where('from_district_id', $id)
            ->orWhere('to_district_id', $id)
            ->with(['fromDistrict:id,name', 'toDistrict:id,name'])
            ->get();

        return Inertia::render('Tourist/DistrictDetail', [
            'district' => $district,
            'allDistricts' => $allDistricts,
            'routes' => $routes,
        ]);
    }
}
