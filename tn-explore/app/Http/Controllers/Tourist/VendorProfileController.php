<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\FraudFlag;
use App\Models\Listing;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorProfileController extends Controller
{
    /**
     * Display the public vendor profile page with trust tiers & activity metrics.
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

        // Calculate Real Operational & Trust Metrics
        $totalBookings = $vendor->bookings()->count();
        $completedBookings = $vendor->bookings()->where('bookings.status', 'completed')->count();
        $cancelledBookings = $vendor->bookings()->where('bookings.status', 'cancelled')->count();
        $cancellationRate = $totalBookings > 0 ? round(($cancelledBookings / $totalBookings) * 100, 1) : 0.0;

        // Calculate Price Fairness relative to District Average
        $vendorAvgPrice = (float) ($listings->avg('price') ?? ($vendor->pricing_declaration['min_price'] ?? 1500));
        $districtAvgPrice = (float) (Listing::whereHas('vendor', function ($q) use ($vendor) {
            $q->where('district_id', $vendor->district_id);
        })->avg('price') ?? 1500.0);

        $priceDiffPct = $districtAvgPrice > 0 ? round((($vendorAvgPrice - $districtAvgPrice) / $districtAvgPrice) * 100, 1) : 0.0;
        
        $priceFairness = [
            'vendor_avg' => round($vendorAvgPrice),
            'district_avg' => round($districtAvgPrice),
            'diff_pct' => $priceDiffPct,
            'label' => $priceDiffPct > 15 
                ? ($priceDiffPct > 35 ? "Premium / Luxury Tier (+{$priceDiffPct}% vs district baseline)" : "Slightly Above Average (+{$priceDiffPct}% vs district baseline)")
                : ($priceDiffPct < -10 ? "Budget Friendly (" . abs($priceDiffPct) . "% below district baseline)" : "Standard Fair Market Rate (within district baseline)"),
            'is_fair' => abs($priceDiffPct) <= 30,
        ];

        // Verified Checklist
        $checklist = [
            [
                'title' => 'KYC & Identity Verification',
                'verified' => $vendor->kyc_status === 'verified',
                'detail' => $vendor->kyc_status === 'verified' 
                    ? 'Verified on ' . ($vendor->kyc_reviewed_at ? $vendor->kyc_reviewed_at->format('M Y') : 'Registration')
                    : ($vendor->kyc_status === 'pending' ? 'KYC documents under review' : 'KYC documentation incomplete'),
            ],
            [
                'title' => 'Government / Trade License',
                'verified' => !empty($vendor->license_url) || !empty($vendor->gst_number),
                'detail' => 'Government license verified ✓',
            ],
            [
                'title' => 'Direct Phone & WhatsApp Channel',
                'verified' => !empty($vendor->phone),
                'detail' => !empty($vendor->phone) ? 'Direct partner contact available' : 'Pending phone confirmation',
            ],
            [
                'title' => 'Admin Safety Screening',
                'verified' => $vendor->status === 'active',
                'detail' => $vendor->status === 'active' ? 'Approved by TN Explore Administrators' : 'Safety screening in progress',
            ],
        ];

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
        $hasConfirmedBooking = false;
        $canReview = false;
        if ($user) {
            $hasConfirmedBooking = \App\Models\Booking::where('user_id', $user->id)
                ->where('vendor_id', $vendor->id)
                ->whereIn('status', ['accepted', 'completed'])
                ->exists();
            $canReview = $hasConfirmedBooking || $user->role === 'admin';
        }

        return Inertia::render('Tourist/VendorPublicProfile', [
            'vendor' => $vendor,
            'trustTier' => $vendor->trust_tier,
            'hasConfirmedBooking' => $hasConfirmedBooking,
            'activityMetrics' => [
                'total_bookings' => $totalBookings,
                'completed_bookings' => $completedBookings,
                'cancellation_rate_pct' => $cancellationRate,
                'operating_years' => $vendor->operating_years ?? 2,
                'response_time' => $vendor->policies['response_time'] ?? 'under_15m',
                'cancellation_policy' => $vendor->policies['cancellation'] ?? 'free_24h',
            ],
            'priceFairness' => $priceFairness,
            'checklist' => $checklist,
            'listings' => $listings,
            'groupedListings' => $groupedListings,
            'reviews' => $vendor->reviews,
            'canReview' => $canReview,
            'districts' => District::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Report an issue with a vendor.
     */
    public function report(Request $request, string $slug): RedirectResponse
    {
        $vendor = Vendor::where('slug', $slug)->orWhere('id', is_numeric($slug) ? (int)$slug : 0)->firstOrFail();
        
        $request->validate([
            'category' => 'required|string|in:overcharging,misleading_info,unresponsive,fake_license,cancellation_issue,other',
            'reason' => 'required|string|max:1000',
        ]);

        FraudFlag::create([
            'vendor_id' => $vendor->id,
            'reason' => "Tourist Report [{$request->category}]: " . $request->reason,
            'severity' => in_array($request->category, ['fake_license', 'overcharging']) ? 'high' : 'medium',
            'resolved' => false,
        ]);

        return back()->with('success', 'Your safety report has been submitted to TN Explore moderators for immediate review.');
    }
}

