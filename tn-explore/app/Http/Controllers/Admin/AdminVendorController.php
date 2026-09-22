<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\District;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminVendorController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Vendor::with(['district', 'user', 'listings', 'reviews.tourist', 'bookings']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('owner_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($request->filled('district_id')) {
            $query->where('district_id', $request->district_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('kyc_status')) {
            $query->where('kyc_status', $request->kyc_status);
        }
        if ($request->filled('specialty')) {
            $query->whereJsonContains('specialties', $request->specialty);
        }

        $vendors = $query->orderBy('created_at', 'desc')->paginate(15)->withQueryString();
        $districts = District::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/Vendors/Index', [
            'vendors' => $vendors,
            'districts' => $districts,
            'filters' => $request->only(['search', 'district_id', 'status', 'kyc_status', 'specialty']),
        ]);
    }

    public function show($id): Response
    {
        $vendor = Vendor::with(['district', 'user', 'listings.bookings', 'reviews.tourist', 'bookings.tourist'])->findOrFail($id);

        return Inertia::render('Admin/Vendors/Show', [
            'vendor' => $vendor,
        ]);
    }

    public function updateStatus(Request $request, $id): RedirectResponse
    {
        $vendor = Vendor::findOrFail($id);
        $request->validate([
            'status' => 'required|in:active,pending,suspended,banned',
            'reason' => 'nullable|string|max:500',
        ]);

        $prevStatus = $vendor->status;
        $vendor->update(['status' => $request->status]);

        AuditLog::log(
            "vendor_status_changed_to_{$request->status}",
            'vendor',
            $vendor->id,
            "Changed status from {$prevStatus} to {$request->status}. Reason: " . ($request->reason ?? 'Admin discretion')
        );

        return back()->with('success', "Vendor '{$vendor->business_name}' status updated to " . ucfirst($request->status));
    }

    public function updateKyc(Request $request, $id): RedirectResponse
    {
        $vendor = Vendor::findOrFail($id);
        $request->validate([
            'kyc_status' => 'required|in:verified,pending,incomplete,rejected',
            'reason' => 'nullable|string|max:500',
        ]);

        $vendor->update([
            'kyc_status' => $request->kyc_status,
            'kyc_rejected_reason' => $request->reason,
            'status' => ($request->kyc_status === 'verified') ? 'active' : $vendor->status,
        ]);

        AuditLog::log(
            "vendor_kyc_{$request->kyc_status}",
            'vendor',
            $vendor->id,
            "KYC status set to {$request->kyc_status}. Reason: " . ($request->reason ?? 'Document verification audit')
        );

        return back()->with('success', "Vendor KYC status updated to " . ucfirst($request->kyc_status));
    }

    public function sendWarning(Request $request, $id): RedirectResponse
    {
        $vendor = Vendor::findOrFail($id);
        $request->validate([
            'warning_message' => 'required|string|max:1000',
        ]);

        AuditLog::log(
            'vendor_warning_sent',
            'vendor',
            $vendor->id,
            "Warning sent: " . $request->warning_message
        );

        return back()->with('success', "Official warning notice dispatched to {$vendor->business_name}.");
    }
}
