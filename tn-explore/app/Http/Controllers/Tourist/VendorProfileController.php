<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Listing;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorProfileController extends Controller
{
    /**
     * Display the public vendor profile page.
     */
    public function show(string $slug): Response
    {
        $vendor = Vendor::where('slug', $slug)
            ->orWhere('id', is_numeric($slug) ? (int)$slug : 0)
            ->with([
                'district',
                'reviews' => function ($q) {
                    $q->where('is_approved', true)
                      ->with(['tourist:id,name,avatar', 'vendorReply', 'votes'])
                      ->orderBy('created_at', 'desc');
                }
            ])
            ->firstOrFail();

        $listings = Listing::where('vendor_id', $vendor->id)
            ->where('is_active', true)
            ->where('status', '!=', 'draft')
            ->orderBy('created_at', 'desc')
            ->get();

        // Group listings by specialty type
        $groupedListings = [
            'all' => $listings,
            'bus' => $listings->where('type', 'bus')->values(),
            'car' => $listings->where('type', 'car')->values(),
            'guide' => $listings->where('type', 'guide')->values(),
            'package' => $listings->where('type', 'package')->values(),
            'hotel' => $listings->whereIn('type', ['hotel', 'hotel_room'])->values(),
            'restaurant' => $listings->whereIn('type', ['restaurant', 'food_item'])->values(),
        ];

        $user = auth()->user();
        $canReview = false;
        if ($user) {
            $hasBooking = \App\Models\Booking::where('user_id', $user->id)
                ->where('vendor_id', $vendor->id)
                ->exists();
            $canReview = $hasBooking || $user->role === 'admin';
        }

        return Inertia::render('Tourist/VendorPublicProfile', [
            'vendor' => $vendor,
            'listings' => $listings,
            'groupedListings' => $groupedListings,
            'reviews' => $vendor->reviews,
            'canReview' => $canReview,
            'districts' => District::select('id', 'name')->orderBy('name')->get(),
        ]);
    }
}
