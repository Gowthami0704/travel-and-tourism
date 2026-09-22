<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminKycController extends Controller
{
    public function index(): Response
    {
        $pendingVendors = Vendor::where('kyc_status', 'pending')
            ->orWhere(function ($q) {
                $q->whereNotNull('license_url')->where('kyc_status', '!=', 'verified');
            })
            ->with(['district', 'user', 'listings'])
            ->orderBy('updated_at', 'desc')
            ->get();

        $verifiedVendors = Vendor::where('kyc_status', 'verified')
            ->with(['district', 'user'])
            ->orderBy('updated_at', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('Admin/Kyc/Index', [
            'pendingVendors' => $pendingVendors,
            'verifiedVendors' => $verifiedVendors,
        ]);
    }

    public function approve(Request $request, $id): RedirectResponse
    {
        $vendor = Vendor::findOrFail($id);
        $vendor->update([
            'kyc_status' => 'verified',
            'status' => 'active',
            'trust_score' => max($vendor->trust_score, 0.920),
        ]);

        AuditLog::log(
            'kyc_approved',
            'vendor',
            $vendor->id,
            "Officer verified license credentials for {$vendor->business_name}."
        );

        return back()->with('success', "KYC verified and approved for {$vendor->business_name}!");
    }

    public function reject(Request $request, $id): RedirectResponse
    {
        $vendor = Vendor::findOrFail($id);
        $request->validate([
            'rejection_reason_type' => 'required|string',
            'rejection_notes' => 'nullable|string|max:1000',
        ]);

        $reason = $request->rejection_reason_type . ($request->rejection_notes ? " - " . $request->rejection_notes : '');

        $vendor->update([
            'kyc_status' => 'rejected',
            'kyc_rejected_reason' => $reason,
        ]);

        AuditLog::log(
            'kyc_rejected',
            'vendor',
            $vendor->id,
            "Officer rejected KYC for {$vendor->business_name}. Reason: {$reason}"
        );

        return back()->with('success', "KYC submission rejected for {$vendor->business_name}.");
    }
}
