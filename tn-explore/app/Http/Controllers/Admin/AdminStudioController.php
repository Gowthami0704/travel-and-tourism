<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\FraudFlag;
use App\Models\Vehicle;
use App\Models\VendorMedia;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminStudioController extends Controller
{
    /**
     * Vendor Media & Photos Review Queue
     */
    public function mediaQueue(Request $request): Response
    {
        $status = $request->query('status', 'pending');

        $media = VendorMedia::with(['vendor', 'place', 'tourist'])
            ->when($status !== 'all', function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->latest()
            ->paginate(24)
            ->withQueryString();

        $stats = [
            'pending_count' => VendorMedia::where('status', 'pending')->count(),
            'approved_count' => VendorMedia::where('status', 'approved')->count(),
            'rejected_count' => VendorMedia::where('status', 'rejected')->count(),
            'duplicate_flags_count' => FraudFlag::where('flag_type', 'duplicate_photo_detected')->where('status', 'pending_review')->count(),
        ];

        return Inertia::render('Admin/Studio/MediaQueue', [
            'media' => $media,
            'stats' => $stats,
            'currentStatus' => $status,
            'status' => session('status'),
        ]);
    }

    /**
     * Approve or reject a media asset
     */
    public function updateMediaStatus(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'reject_reason' => 'nullable|string|max:500',
        ]);

        $media = VendorMedia::findOrFail($id);
        $media->update([
            'status' => $request->status,
            'reject_reason' => $request->status === 'rejected' ? $request->reject_reason : null,
        ]);

        AuditLog::log(
            'admin_media_' . $request->status,
            'vendor_media',
            $media->id,
            "Media #{$media->id} for Vendor #{$media->vendor_id} was marked {$request->status}." . ($request->reject_reason ? " Reason: {$request->reject_reason}" : "")
        );

        return back()->with('status', "Media photo #{$media->id} has been {$request->status}.");
    }

    /**
     * Vehicle Documents & Fleet Oversight
     */
    public function fleetReview(Request $request): Response
    {
        $vehicles = Vehicle::with(['vendor', 'district', 'rates', 'documents', 'media'])
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Studio/FleetReview', [
            'vehicles' => $vehicles,
            'status' => session('status'),
        ]);
    }

    /**
     * Verify or reject vehicle documents
     */
    public function verifyVehicle(Request $request, int $id): RedirectResponse
    {
        $vehicle = Vehicle::with('documents')->findOrFail($id);
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        $vehicle->update([
            'status' => $request->status,
            'rejection_reason' => $request->status === 'rejected' ? $request->rejection_reason : null,
        ]);

        if ($vehicle->documents) {
            $vehicle->documents->update([
                'is_verified' => $request->status === 'approved',
                'verified_at' => $request->status === 'approved' ? now() : null,
            ]);
        }

        AuditLog::log(
            'admin_vehicle_' . $request->status,
            'vehicle',
            $vehicle->id,
            "Vehicle #{$vehicle->id} ({$vehicle->make_model}) for Vendor #{$vehicle->vendor_id} was {$request->status}."
        );

        return back()->with('status', "Vehicle #{$vehicle->id} has been {$request->status}.");
    }
}
