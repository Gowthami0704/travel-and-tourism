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

        if ($request->status === 'active' && $vendor->kyc_status !== 'verified') {
            return back()->withErrors(['status' => 'Verify the vendor KYC before approving.']);
        }

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

    public function downloadKycDocument(Request $request, $id)
    {
        $vendor = Vendor::findOrFail($id);
        $type = $request->query('type', 'license');

        $docPath = match ($type) {
            'aadhaar' => $vendor->aadhaar_document_path,
            'gstin'   => $vendor->gstin_document_path,
            default   => $vendor->tourism_license_path ?: $vendor->license_url,
        };

        if (empty($docPath)) {
            abort(404, "No {$type} document on file for this partner.");
        }

        $relativePath = ltrim(str_replace('/storage/', '', $docPath), '/');

        // Check private local disk first
        if (\Illuminate\Support\Facades\Storage::disk('local')->exists($relativePath)) {
            AuditLog::log(
                'admin_viewed_kyc_document',
                'vendor',
                $vendor->id,
                "Admin inspected {$type} document ({$relativePath}) for partner: {$vendor->business_name}."
            );
            $fullPath = \Illuminate\Support\Facades\Storage::disk('local')->path($relativePath);
            return response()->file($fullPath);
        }

        // Fallback for existing legacy uploads in public disk
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($relativePath)) {
            AuditLog::log(
                'admin_viewed_kyc_document',
                'vendor',
                $vendor->id,
                "Admin inspected legacy {$type} document ({$relativePath}) for partner: {$vendor->business_name}."
            );
            $fullPath = \Illuminate\Support\Facades\Storage::disk('public')->path($relativePath);
            return response()->file($fullPath);
        }

        abort(404, 'Requested verification document file not found on server disk.');
    }

    public function approvePrimaryDistrict(Request $request, $id, $districtId): RedirectResponse
    {
        $vendor = Vendor::findOrFail($id);
        $vd = \App\Models\VendorDistrict::where('vendor_id', $vendor->id)
            ->where('district_id', $districtId)
            ->firstOrFail();

        $vd->update([
            'level' => 'primary',
            'status' => 'approved',
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
        ]);

        AuditLog::log(
            'primary_district_approved',
            'vendor',
            $vendor->id,
            "Admin approved primary district (ID: {$districtId}) for {$vendor->business_name}."
        );

        return back()->with('success', "Primary district approved for {$vendor->business_name}.");
    }

    public function revokeExtendedDistrict(Request $request, $id, $districtId): RedirectResponse
    {
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $vendor = Vendor::findOrFail($id);
        $vd = \App\Models\VendorDistrict::where('vendor_id', $vendor->id)
            ->where('district_id', $districtId)
            ->first();

        if ($vd) {
            $vd->delete();
        }

        AuditLog::log(
            'extended_district_revoked',
            'vendor',
            $vendor->id,
            "Admin revoked extended district (ID: {$districtId}) for {$vendor->business_name}. Reason: " . ($request->reason ?? 'Quality/Coverage audit')
        );

        return back()->with('success', "Extended district revoked for {$vendor->business_name}.");
    }

    public function updateCredentials(Request $request, $id): RedirectResponse
    {
        $vendor = Vendor::with('user')->findOrFail($id);
        $user = $vendor->user;
        if (!$user) {
            return back()->withErrors(['user' => 'No linked user account found for this vendor.']);
        }

        $request->validate([
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'name' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:6',
        ]);

        $user->email = $request->email;
        if ($request->filled('name')) {
            $user->name = $request->name;
            $vendor->update(['owner_name' => $request->name]);
        }
        if ($request->filled('password')) {
            $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        }
        $user->save();

        AuditLog::log(
            'admin_updated_vendor_credentials',
            'user',
            $user->id,
            "Admin updated credentials (email: {$user->email}) for Vendor #{$vendor->id} ({$vendor->business_name})"
        );

        return back()->with('success', "Credentials for '{$vendor->business_name}' ({$user->email}) updated successfully.");
    }
}
