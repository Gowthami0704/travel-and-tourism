<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Listing;
use App\Models\Review;
use App\Models\Vendor;
use App\Models\VendorAvailability;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    /**
     * Store a new booking made by a tourist.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'listing_id' => 'required|exists:listings,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'travelers' => 'nullable|integer|min:1',
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'special_requests' => 'nullable|string|max:1000',
        ]);

        $listing = Listing::with('vendor')->findOrFail($request->listing_id);
        $vendor = $listing->vendor;

        // 0. Prevent vendors from booking their own listings
        if (Auth::check()) {
            $currentUser = Auth::user();
            if ($currentUser->role === 'vendor' && $vendor && $vendor->user_id === $currentUser->id) {
                return back()->withErrors([
                    'booking' => 'Vendors cannot book their own listings or services.',
                ]);
            }
        }

        // 1. Vendor approval check
        if (!$vendor || !$vendor->isVerified()) {
            return back()->withErrors([
                'vendor' => 'This vendor is currently undergoing administrative verification and cannot accept bookings yet.',
            ]);
        }

        // 2. District and package approval check
        if ($listing->type === 'package' && $listing->isOutsideTn() && !$listing->isApproved()) {
            return back()->withErrors([
                'package' => 'This outside-TN tour package is pending permit verification.',
            ]);
        }

        // Two-Tier Service Check: Guide service allowed only in primary districts
        if ($listing->district_id && !$vendor->operatesInDistrict($listing->district_id, $listing->type)) {
            $msg = $listing->type === 'guide'
                ? 'Local guide service is restricted to verified primary districts only.'
                : 'The vendor is not authorized to operate services in the selected district.';
            return back()->withErrors(['district' => $msg]);
        }

        // Adventure health declaration & age check
        if ($listing->is_adventure) {
            if (!$request->boolean('health_declaration_accepted', true)) {
                return back()->withErrors(['adventure' => 'Health declaration must be accepted for adventure activities.']);
            }
            if ($request->tourist_age && $request->tourist_age < 14) {
                return back()->withErrors(['adventure' => 'Participants must be at least 14 years old for adventure packages.']);
            }
        }

        // 3. Availability Calendar double-booking prevention & Atomic Group Seats
        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate = $request->end_date ? Carbon::parse($request->end_date)->endOfDay() : $startDate->copy()->endOfDay();
        $travelers = (int) $request->input('travelers', $request->input('quantity', $request->input('num_people', 1)));

        // Atomic group departure seat decrement
        if ($request->departure_id) {
            $departure = \App\Models\PackageDeparture::where('id', $request->departure_id)->lockForUpdate()->first();
            if (!$departure || $departure->seats_left < $travelers || $departure->isSoldOut()) {
                return back()->withErrors(['seats' => 'Selected group departure is sold out or does not have enough seats remaining.']);
            }
            $departure->seats_left = max(0, $departure->seats_left - $travelers);
            if ($departure->seats_left <= 0) {
                $departure->status = 'sold_out';
            }
            $departure->save();
        }

        $hasConflict = VendorAvailability::where('vendor_id', $vendor->id)
            ->whereDate('date', '>=', $startDate->toDateString())
            ->whereDate('date', '<=', $endDate->toDateString())
            ->whereIn('status', ['booked', 'blocked'])
            ->exists();

        if ($hasConflict) {
            return back()->withErrors([
                'dates' => 'The vendor is fully booked or unavailable on the requested dates. Please select alternative dates.',
            ]);
        }

        $days = max(1, $startDate->diffInDays($endDate) + 1);
        $basePrice = $listing->price_per_person ?: $listing->price;
        $totalAmount = $basePrice * $days;
        if (in_array($listing->type, ['package', 'guide', 'food_item'])) {
            $totalAmount = $basePrice * $travelers;
        }

        $touristId = Auth::id();
        if (!$touristId) {
            $touristUser = \App\Models\User::where('role', 'tourist')->first();
            $touristId = $touristUser ? $touristUser->id : 1;
        }

        $booking = Booking::create([
            'tourist_id' => $touristId,
            'customer_name' => $request->name ?? (Auth::user()?->name ?? 'Guest Traveler'),
            'customer_phone' => $request->phone ?? (Auth::user()?->phone ?? '+91 98401 56789'),
            'customer_email' => $request->email ?? (Auth::user()?->email ?? 'traveler@gmail.com'),
            'listing_id' => $listing->id,
            'departure_id' => $request->departure_id,
            'start_date' => $startDate->toDateString(),
            'end_date' => $endDate->toDateString(),
            'travelers' => $travelers,
            'num_people' => $travelers,
            'tourist_age' => $request->tourist_age,
            'health_declaration_accepted' => $request->boolean('health_declaration_accepted', true),
            'special_requests' => $request->special_requests ?? $request->notes,
            'total_amount' => $totalAmount,
            'status' => 'pending',
        ]);

        return back()->with('success', "Booking request submitted successfully for '{$listing->title}'! Vendor {$vendor->business_name} has received your request.");
    }

    /**
     * Store a verified review submitted by a tourist after a completed trip.
     */
    public function storeReview(Request $request): RedirectResponse
    {
        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:5|max:1000',
            'district_id' => 'nullable|exists:districts,id',
        ]);

        $touristId = Auth::id();
        if (!$touristId) {
            return back()->withErrors(['auth' => 'Please sign in to submit a verified tourist review.']);
        }

        // Enforce: only tourists with completed bookings can review
        $hasCompletedBooking = Booking::where('tourist_id', $touristId)
            ->where('status', 'completed')
            ->whereHas('listing', function ($q) use ($request) {
                $q->where('vendor_id', $request->vendor_id);
            })
            ->exists();

        if (!$hasCompletedBooking) {
            return back()->withErrors([
                'booking' => 'Only verified travelers with completed bookings with this partner can leave reviews.',
            ]);
        }

        $vendor = Vendor::findOrFail($request->vendor_id);
        $districtId = $request->district_id ?? $vendor->district_id;

        Review::updateOrCreate(
            [
                'tourist_id' => $touristId,
                'vendor_id' => $vendor->id,
            ],
            [
                'rating' => $request->rating,
                'comment' => $request->comment,
                'district_id' => $districtId,
                'status' => 'approved',
            ]
        );

        return back()->with('success', 'Thank you! Your verified partner review has been recorded.');
    }
}
