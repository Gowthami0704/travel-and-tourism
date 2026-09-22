<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorApprovalController extends Controller
{
    public function index(): Response
    {
        $vendors = Vendor::with(['user', 'district', 'listings'])
            ->withCount('reviews')
            ->orderBy('status', 'asc') // pending first
            ->orderBy('created_at', 'desc')
            ->get();

        $listings = Listing::with(['vendor.user', 'vendor.district'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/VendorManagement', [
            'vendors' => $vendors,
            'listings' => $listings,
        ]);
    }

    public function approve($id): RedirectResponse
    {
        $vendor = Vendor::findOrFail($id);
        $vendor->update([
            'status' => 'active',
            'trust_score' => max(0.850, $vendor->trust_score),
        ]);

        return back()->with('success', "Vendor '{$vendor->business_name}' has been APPROVED! Their listings are now active on the tourist marketplace.");
    }

    public function reject($id): RedirectResponse
    {
        $vendor = Vendor::findOrFail($id);
        $vendor->update(['status' => 'suspended']);

        return back()->with('success', "Vendor '{$vendor->business_name}' has been SUSPENDED.");
    }

    public function toggleListing($id): RedirectResponse
    {
        $listing = Listing::findOrFail($id);
        $listing->update(['is_active' => !$listing->is_active]);

        $status = $listing->is_active ? 'verified & published' : 'hidden';
        return back()->with('success', "Listing '{$listing->title}' is now {$status}.");
    }
}
