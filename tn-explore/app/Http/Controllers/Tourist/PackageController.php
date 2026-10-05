<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Listing;
use App\Models\Place;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    /**
     * Public Packages Catalogue
     */
    public function index(Request $request): Response
    {
        $query = Listing::with(['vendor', 'startDistrict', 'packageDepartures'])
            ->published();

        // Filters
        if ($request->filled('district_id')) {
            $query->where(function ($q) use ($request) {
                $q->where('district_id', $request->district_id)
                  ->orWhere('start_district_id', $request->district_id);
            });
        }

        if ($request->filled('duration')) {
            $duration = (int) $request->duration;
            if ($duration === 1) {
                $query->where('duration_days', 1);
            } elseif ($duration === 3) {
                $query->whereBetween('duration_days', [2, 3]);
            } elseif ($duration === 5) {
                $query->whereBetween('duration_days', [4, 6]);
            } else {
                $query->where('duration_days', '>=', 7);
            }
        }

        if ($request->filled('budget_max')) {
            $query->where('price_per_person', '<=', (float) $request->budget_max);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $packages = $query->latest()->paginate(12)->withQueryString();
        $districts = District::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Tourist/Packages/Index', [
            'packages' => $packages,
            'districts' => $districts,
            'filters' => $request->only(['district_id', 'duration', 'budget_max', 'category']),
        ]);
    }

    /**
     * Public Tour Package Detail Page (Clean Top Card + Tabs presentation)
     */
    public function show(int $id): Response
    {
        $package = Listing::with([
            'vendor',
            'startDistrict',
            'packageDepartures' => function ($query) {
                $query->orderBy('departure_date', 'asc');
            },
            'bookings.review'
        ])->published()->findOrFail($id);

        // Fetch place details for day-wise itinerary stops
        $dayItinerary = $package->day_wise_itinerary ?: [];
        $placeIds = [];
        foreach ($dayItinerary as $day) {
            if (!empty($day['place_id'])) {
                $placeIds[] = $day['place_id'];
            }
            if (!empty($day['stops']) && is_array($day['stops'])) {
                foreach ($day['stops'] as $stop) {
                    if (!empty($stop['place_id'])) {
                        $placeIds[] = $stop['place_id'];
                    }
                }
            }
        }

        $referencedPlaces = Place::whereIn('id', array_unique($placeIds))
            ->get(['id', 'name', 'district_id', 'category', 'image_url'])
            ->keyBy('id');

        // Other packages from same vendor or region
        $otherPackages = Listing::with(['vendor', 'packageDepartures'])
            ->where('id', '!=', $package->id)
            ->where('vendor_id', $package->vendor_id)
            ->published()
            ->take(3)
            ->get();

        return Inertia::render('Tourist/Packages/Show', [
            'package' => $package,
            'referencedPlaces' => $referencedPlaces,
            'otherPackages' => $otherPackages,
        ]);
    }

    /**
     * Side-by-side comparison for up to 3 packages
     */
    public function compare(Request $request): Response
    {
        $ids = (array) $request->input('ids', []);
        $ids = array_slice(array_filter($ids, 'is_numeric'), 0, 3);

        $packages = Listing::with(['vendor', 'startDistrict', 'packageDepartures'])
            ->whereIn('id', $ids)
            ->published()
            ->get();

        return Inertia::render('Tourist/Packages/Compare', [
            'packages' => $packages,
        ]);
    }
}
