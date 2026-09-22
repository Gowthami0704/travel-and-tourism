<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Listing;
use App\Models\Review;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    /**
     * Store a new booking made by a tourist (authenticated or guest).
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'listing_id' => 'required|exists:listings,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date',
            'travelers' => 'nullable|integer|min:1',
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'special_requests' => 'nullable|string|max:1000',
        ]);

        $listing = Listing::findOrFail($request->listing_id);
        $days = 1;
        if ($request->end_date && $request->end_date !== $request->start_date) {
            $start = new \DateTime($request->start_date);
            $end = new \DateTime($request->end_date);
            $days = max(1, $start->diff($end)->days);
        }

        $travelers = (int)$request->input('travelers', 1);
        $totalAmount = $listing->price * $days;
        if (in_array($listing->type, ['package', 'guide', 'food_item'])) {
            $totalAmount = $listing->price * $travelers;
        }

        $touristId = Auth::id();
        if (!$touristId) {
            // Find or assign demo tourist
            $touristUser = \App\Models\User::where('role', 'tourist')->first();
            $touristId = $touristUser ? $touristUser->id : 1;
        }

        Booking::create([
            'tourist_id' => $touristId,
            'customer_name' => $request->name ?? (Auth::user()?->name ?? 'Guest Traveler'),
            'customer_phone' => $request->phone ?? (Auth::user()?->phone ?? '+91 98401 56789'),
            'customer_email' => $request->email ?? (Auth::user()?->email ?? 'traveler@gmail.com'),
            'listing_id' => $listing->id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date ?? $request->start_date,
            'travelers' => $travelers,
            'special_requests' => $request->special_requests ?? $request->notes,
            'total_amount' => $totalAmount,
            'status' => 'pending',
        ]);

        return back()->with('success', "Booking request submitted successfully for '{$listing->title}'! Vendor {$listing->vendor?->business_name} has received your request.");
    }

    /**
     * Store a review submitted by a tourist for a vendor.
     */
    public function storeReview(Request $request): RedirectResponse
    {
        $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:5|max:1000',
        ]);

        Review::updateOrCreate(
            [
                'tourist_id' => Auth::id(),
                'vendor_id' => $request->vendor_id,
            ],
            [
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]
        );

        return back()->with('success', 'Thank you! Your verified review has been submitted.');
    }
}
