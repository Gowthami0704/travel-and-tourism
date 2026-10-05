<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\District;
use App\Models\DistrictChangeRequest;
use App\Models\Vendor;
use App\Models\VendorDistrict;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDistrictChangeController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = DistrictChangeRequest::with(['vendor.user', 'oldDistrict', 'newDistrict'])
            ->orderBy('created_at', 'desc');

        if ($user && $user->isDistrictAdmin() && !empty($user->assigned_district_ids)) {
            $query->where(function ($q) use ($user) {
                $q->whereIn('old_district_id', $user->assigned_district_ids)
                  ->orWhereIn('new_district_id', $user->assigned_district_ids);
            });
        }

        $requests = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Districts/ChangeRequests', [
            'requests' => $requests,
        ]);
    }

    public function approve(Request $request, $id): RedirectResponse
    {
        $changeReq = DistrictChangeRequest::with('vendor')->findOrFail($id);
        $vendor = $changeReq->vendor;

        // Execute district swap
        $approvedIds = $vendor->getApprovedDistrictIds();
        $updatedIds = array_values(array_diff($approvedIds, [(int)$changeReq->old_district_id]));
        $updatedIds[] = (int)$changeReq->new_district_id;
        $updatedIds = array_slice(array_unique($updatedIds), 0, 2);

        $vendor->update([
            'approved_district_ids' => $updatedIds,
            'district_id' => $updatedIds[0] ?? $vendor->district_id,
        ]);

        // Update vendor_districts pivot table
        VendorDistrict::where('vendor_id', $vendor->id)
            ->where('district_id', $changeReq->old_district_id)
            ->delete();

        VendorDistrict::updateOrCreate(
            ['vendor_id' => $vendor->id, 'district_id' => $changeReq->new_district_id],
            ['status' => 'approved', 'reviewed_at' => now(), 'reviewed_by' => auth()->id()]
        );

        $changeReq->update([
            'status' => 'approved',
            'admin_notes' => $request->admin_notes,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        $oldName = District::find($changeReq->old_district_id)?->name;
        $newName = District::find($changeReq->new_district_id)?->name;

        AuditLog::log(
            'district_change_approved',
            'vendor',
            $vendor->id,
            "Officer approved district swap for {$vendor->business_name}: {$oldName} → {$newName}."
        );

        return back()->with('success', "District change approved for {$vendor->business_name} ({$oldName} → {$newName})!");
    }

    public function reject(Request $request, $id): RedirectResponse
    {
        $changeReq = DistrictChangeRequest::with('vendor')->findOrFail($id);

        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $changeReq->update([
            'status' => 'rejected',
            'admin_notes' => $request->reason,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        AuditLog::log(
            'district_change_rejected',
            'vendor',
            $changeReq->vendor_id,
            "Officer rejected district swap request. Reason: {$request->reason}"
        );

        return back()->with('success', 'District change request rejected.');
    }
}
