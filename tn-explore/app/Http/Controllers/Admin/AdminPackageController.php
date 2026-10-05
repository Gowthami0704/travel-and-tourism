<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Listing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminPackageController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Listing::with(['vendor.user', 'district'])
            ->where('type', 'package')
            ->orderBy('created_at', 'desc');

        // District admin restriction
        if ($user && $user->isDistrictAdmin() && !empty($user->assigned_district_ids)) {
            $query->whereIn('district_id', $user->assigned_district_ids);
        }

        if ($request->filled('scope')) {
            $query->where('scope', $request->scope);
        }

        if ($request->filled('approval_status')) {
            $query->where('approval_status', $request->approval_status);
        }

        $packages = $query->paginate(15)->withQueryString();

        $pendingOutsideCount = Listing::where('type', 'package')
            ->where('scope', 'outside_tn')
            ->where('approval_status', 'pending_approval')
            ->count();

        return Inertia::render('Admin/Packages/Index', [
            'packages' => $packages,
            'filters' => $request->only(['scope', 'approval_status']),
            'pendingOutsideCount' => $pendingOutsideCount,
        ]);
    }

    public function approve(Request $request, $id): RedirectResponse
    {
        $listing = Listing::with('vendor')->findOrFail($id);

        $listing->update([
            'approval_status' => 'approved',
            'is_active' => true,
            'status' => 'published',
            'rejection_reason' => null,
        ]);

        AuditLog::log(
            'package_approved',
            'listing',
            $listing->id,
            "Officer approved package tour '{$listing->title}' ({$listing->scope}) by {$listing->vendor->business_name}."
        );

        return back()->with('success', "Package tour '{$listing->title}' has been approved and published!");
    }

    public function reject(Request $request, $id): RedirectResponse
    {
        $listing = Listing::with('vendor')->findOrFail($id);

        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $listing->update([
            'approval_status' => 'rejected',
            'is_active' => false,
            'status' => 'draft',
            'rejection_reason' => $request->reason,
        ]);

        AuditLog::log(
            'package_rejected',
            'listing',
            $listing->id,
            "Officer rejected package tour '{$listing->title}'. Reason: {$request->reason}"
        );

        return back()->with('success', "Package tour '{$listing->title}' has been rejected. Reason logged.");
    }
}
