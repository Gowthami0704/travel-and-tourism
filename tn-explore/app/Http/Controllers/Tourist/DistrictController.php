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
        $query = District::with([
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
        ]);

        if (is_numeric($id)) {
            $district = $query->findOrFail($id);
        } else {
            $formattedName = str_replace(['-', '_'], ' ', $id);
            $district = $query->where('name', 'like', "%{$formattedName}%")->firstOrFail();
        }

        // Fetch all verified active vendors operating in this district (primary or extended)
        $districtId = $district->id;
        $allActiveVendors = Vendor::where('status', 'active')
            ->where('kyc_status', 'verified')
            ->with(['listings' => function ($l) {
                $l->where('is_active', true);
            }, 'reviews', 'user:id,name,phone', 'vendorDistricts', 'state'])
            ->get();

        $districtVendors = $allActiveVendors->filter(function ($vendor) use ($districtId) {
            return $vendor->operatesInDistrict($districtId);
        })->map(function ($vendor) use ($districtId) {
            $tier = $vendor->getDistrictTier($districtId);
            $distRating = $vendor->getDistrictRating($districtId);
            $vendor->tier = $tier;
            $vendor->is_primary = $tier === 'primary';
            $vendor->district_specific_rating = $distRating['rating'];
            $vendor->district_review_count = $distRating['review_count'];
            $vendor->is_local_tn = ($vendor->state_name ?? 'Tamil Nadu') === 'Tamil Nadu';
            return $vendor;
        })->sort(function ($a, $b) {
            // 1. Primary district vendors ("Local expert") rank first
            if ($a->is_primary !== $b->is_primary) {
                return $a->is_primary ? -1 : 1;
            }
            // 2. Local TN vendors rank before out-of-state vendors
            if ($a->is_local_tn !== $b->is_local_tn) {
                return $a->is_local_tn ? -1 : 1;
            }
            // 3. Trust score descending
            $trustDiff = ($b->trust_score ?? 0.85) <=> ($a->trust_score ?? 0.85);
            if ($trustDiff !== 0) {
                return $trustDiff;
            }
            // 4. Rating descending
            return ($b->district_specific_rating ?? 0) <=> ($a->district_specific_rating ?? 0);
        })->values();

        // Calculate other districts for transit comparison dropdown
        $allDistricts = District::where('id', '!=', $district->id)->orderBy('name')->get(['id', 'name']);

        // Collect all active routes connected to this district
        $routes = Route::where('from_district_id', $district->id)
            ->orWhere('to_district_id', $district->id)
            ->with(['fromDistrict:id,name', 'toDistrict:id,name'])
            ->get();

        return Inertia::render('Tourist/DistrictDetail', [
            'district' => $district,
            'districtVendors' => $districtVendors,
            'allDistricts' => $allDistricts,
            'routes' => $routes,
        ]);
    }
}
