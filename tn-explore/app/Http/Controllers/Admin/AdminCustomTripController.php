<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomTrip;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminCustomTripController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'all');
        $region = $request->query('region', 'all');

        $query = CustomTrip::with(['user', 'proposals.vendor'])
            ->withCount('proposals')
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($region !== 'all') {
            $query->where('destination_region', $region);
        }

        $trips = $query->paginate(15)->withQueryString();

        $counts = [
            'total' => CustomTrip::count(),
            'pending' => CustomTrip::where('status', 'pending_verification')->count(),
            'verified' => CustomTrip::where('status', 'verified_active')->count(),
            'booked' => CustomTrip::where('status', 'booked')->count(),
            'kerala' => CustomTrip::where('destination_region', 'kerala')->count(),
            'inside_tn' => CustomTrip::where('destination_region', 'inside_tn')->count(),
        ];

        return Inertia::render('Admin/CustomTrips/Index', [
            'trips' => $trips,
            'filters' => [
                'status' => $status,
                'region' => $region,
            ],
            'counts' => $counts,
        ]);
    }

    public function verify(Request $request, $id)
    {
        $trip = CustomTrip::findOrFail($id);
        $trip->update([
            'status' => 'verified_active',
            'admin_notes' => $request->input('admin_notes', 'Verified and cleared for vendor quotation.'),
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        return back()->with('success', "Custom trip #{$trip->id} ({$trip->title}) has been verified and published to verified vendors!");
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $trip = CustomTrip::findOrFail($id);
        $trip->update([
            'status' => 'rejected',
            'admin_notes' => $request->input('reason'),
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
        ]);

        return back()->with('success', "Custom trip #{$trip->id} has been rejected with feedback.");
    }

    public function destroy($id)
    {
        $trip = CustomTrip::findOrFail($id);
        $trip->delete();

        return back()->with('success', "Custom trip #{$id} has been deleted.");
    }
}
