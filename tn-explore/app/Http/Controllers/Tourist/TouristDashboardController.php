<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\CustomTrip;
use App\Models\District;
use App\Models\Place;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TouristDashboardController extends Controller
{
    public function index(Request $request): Response|RedirectResponse
    {
        $user = Auth::user();

        // If user is Admin or Vendor, redirect them to their dedicated dashboard
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        } elseif ($user->isVendor()) {
            return redirect()->route('vendor.dashboard');
        }

        // Get user's custom trip requests with proposal counts
        $customTrips = CustomTrip::where('user_id', $user->id)
            ->withCount('proposals')
            ->with(['user', 'proposals.vendor.district', 'chats'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Get user's bookings with listing and vendor info
        $bookings = Booking::where('tourist_id', $user->id)
            ->with(['listing.vendor.district'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Get user's reviews
        $reviews = Review::where('tourist_id', $user->id)
            ->with('vendor')
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all 38 districts with comprehensive stats for the user dashboard
        $districts = District::withCount([
            'places',
            'places as hidden_gems_count' => function ($q) {
                $q->where('is_hidden_gem', true);
            },
            'foodDishes',
            'vendors' => function ($q) {
                $q->where('status', 'active');
            }
        ])->orderBy('name')->get();

        $recommendedHiddenGems = Place::where('is_hidden_gem', true)
            ->with('district:id,name,region,hero_image_url')
            ->inRandomOrder()
            ->limit(6)
            ->get();

        $regions = ['All', 'North', 'South', 'Kongu', 'Central', 'Coastal'];

        return Inertia::render('Tourist/Dashboard', [
            'customTrips' => $customTrips,
            'bookings' => $bookings,
            'reviews' => $reviews,
            'districts' => $districts,
            'regions' => $regions,
            'recommendedHiddenGems' => $recommendedHiddenGems,
            'stats' => [
                'totalCustomTrips' => $customTrips->count(),
                'totalBookings' => $bookings->count(),
                'activeBookings' => $bookings->whereIn('status', ['pending', 'accepted'])->count(),
                'completedBookings' => $bookings->where('status', 'completed')->count(),
                'totalReviews' => $reviews->count(),
                'totalDistricts' => $districts->count(),
            ],
        ]);
    }
}
