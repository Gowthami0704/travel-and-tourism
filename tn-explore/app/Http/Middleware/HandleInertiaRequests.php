<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        $notifications = [];
        if ($user) {
            // 1. Accepted Bookings for Tourist
            $acceptedBookings = \App\Models\Booking::where('tourist_id', $user->id)
                ->where('status', 'accepted')
                ->with(['listing.vendor'])
                ->latest('updated_at')
                ->take(5)
                ->get();

            foreach ($acceptedBookings as $b) {
                $vendorName = $b->listing?->vendor?->business_name ?? 'Verified Partner';
                $listingTitle = $b->listing?->title ?? 'Trip Package';
                $travelers = max(1, (int) ($b->travelers ?? 1));
                $totalAmt = (int) $b->total_amount;
                $perPerson = (int) round($totalAmt / $travelers);
                $formattedAmount = "₹" . number_format($totalAmt) . " total ({$travelers} × ₹" . number_format($perPerson) . ")";

                $notifications[] = [
                    'id' => 'booking_' . $b->id,
                    'type' => 'booking_accepted',
                    'title' => 'Trip Booking Accepted',
                    'message' => "Vendor \"{$vendorName}\" has accepted your trip booking for \"{$listingTitle}\".",
                    'vendor' => $vendorName,
                    'listing' => $listingTitle,
                    'amount' => $b->total_amount,
                    'formatted_amount' => $formattedAmount,
                    'start_date' => $b->start_date ? $b->start_date->format('d M Y') : null,
                    'status' => $b->status,
                    'time' => $b->updated_at?->diffForHumans() ?? 'Recently',
                    'link' => route('dashboard') . '?tab=bookings',
                ];
            }

            // 2. Custom Trip Accepted Proposals or New Vendor Quotes
            if (class_exists(\App\Models\TripProposal::class)) {
                $proposals = \App\Models\TripProposal::whereHas('customTrip', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->whereIn('status', ['accepted', 'submitted'])
                ->with(['vendor', 'customTrip'])
                ->latest('updated_at')
                ->take(5)
                ->get();

                foreach ($proposals as $p) {
                    $vName = $p->vendor?->business_name ?? 'Local Guide';
                    $tripTitle = $p->customTrip?->title ?? 'Custom Itinerary';
                    if ($p->status === 'accepted') {
                        $notifications[] = [
                            'id' => 'proposal_acc_' . $p->id,
                            'type' => 'proposal_accepted',
                            'title' => 'Custom Trip Confirmed',
                            'message' => "Proposal by {$vName} for \"{$tripTitle}\" is confirmed.",
                            'vendor' => $vName,
                            'listing' => $tripTitle,
                            'amount' => $p->quote_price,
                            'status' => 'accepted',
                            'time' => $p->updated_at?->diffForHumans() ?? 'Recently',
                            'link' => route('custom-trips.show', $p->custom_trip_id),
                        ];
                    }
                }
            }

            // 3. For Vendor role: Notification when a tourist books their listing
            if ($user->role === 'vendor' && $user->vendor) {
                $vendorBookings = \App\Models\Booking::whereHas('listing', function ($q) use ($user) {
                    $q->where('vendor_id', $user->vendor->id);
                })
                ->where('status', 'pending')
                ->with(['listing', 'tourist'])
                ->latest('created_at')
                ->take(3)
                ->get();

                foreach ($vendorBookings as $vb) {
                    $notifications[] = [
                        'id' => 'vbooking_' . $vb->id,
                        'type' => 'new_booking_request',
                        'title' => 'New Trip Booking Request',
                        'message' => "{$vb->customer_name} submitted a booking request for \"{$vb->listing?->title}\".",
                        'vendor' => $user->vendor->business_name,
                        'listing' => $vb->listing?->title,
                        'amount' => $vb->total_amount,
                        'status' => 'pending',
                        'time' => $vb->created_at?->diffForHumans() ?? 'Just now',
                        'link' => route('vendor.bookings.index'),
                    ];
                }
            }

            // Deduplicate notifications with identical vendor, trip title, amount, and date
            $notifications = array_values(collect($notifications)->unique(function ($item) {
                return ($item['vendor'] ?? '') . '|' . ($item['listing'] ?? '') . '|' . ($item['amount'] ?? '') . '|' . ($item['status'] ?? '');
            })->all());
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'vendor' => $user->vendor ? [
                        'id' => $user->vendor->id,
                        'business_name' => $user->vendor->business_name,
                        'service_type' => $user->vendor->service_type,
                        'status' => $user->vendor->status,
                        'trust_score' => $user->vendor->trust_score,
                    ] : null,
                ] : null,
            ],
            'notifications' => $notifications,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
