<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\District;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminBookingController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Booking::with(['tourist', 'listing.vendor.district']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', $search)
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhereHas('listing', fn($l) => $l->where('title', 'like', "%{$search}%"))
                  ->orWhereHas('listing.vendor', fn($v) => $v->where('business_name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('district_id')) {
            $districtId = $request->district_id;
            $query->whereHas('listing.vendor', fn($v) => $v->where('district_id', $districtId));
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString();
        $districts = District::select('id', 'name')->orderBy('name')->get();

        $totalRevenue = Booking::whereIn('status', ['accepted', 'completed'])->sum('total_amount');
        $pendingRevenue = Booking::where('status', 'pending')->sum('total_amount');
        $refundedCount = Booking::where('status', 'cancelled')->count();

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'districts' => $districts,
            'filters' => $request->only(['search', 'status', 'district_id']),
            'financialSummary' => [
                'totalRevenue' => $totalRevenue,
                'pendingRevenue' => $pendingRevenue,
                'refundedCount' => $refundedCount,
                'totalCount' => Booking::count(),
            ],
            'isSuperAdmin' => auth()->user()->isSuperAdmin(),
        ]);
    }

    public function overrideStatus(Request $request, $id): RedirectResponse
    {
        $booking = Booking::with('listing.vendor')->findOrFail($id);
        $request->validate([
            'status' => 'required|in:accepted,completed,cancelled,rejected',
            'reason' => 'required|string|max:1000',
        ]);

        $prevStatus = $booking->status;
        $booking->update(['status' => $request->status]);

        AuditLog::log(
            "booking_override_to_{$request->status}",
            'booking',
            $booking->id,
            "Admin overrode booking #{$booking->id} from {$prevStatus} to {$request->status}. Reason: {$request->reason}"
        );

        return back()->with('success', "Booking #{$booking->id} status forced to " . ucfirst($request->status));
    }
}
