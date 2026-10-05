<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\District;
use App\Models\Vendor;
use App\Models\VendorDistrict;
use App\Notifications\VendorKycStatusNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminKycController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = Vendor::pendingKyc()
            ->with(['district', 'user', 'listings', 'vendorDistricts.district', 'verificationMessages.sender'])
            ->orderBy('updated_at', 'desc');

        // District admin restriction
        if ($user && $user->isDistrictAdmin() && !empty($user->assigned_district_ids)) {
            $assigned = $user->assigned_district_ids;
            $query->where(function ($q) use ($assigned) {
                $q->whereIn('district_id', $assigned)
                  ->orWhereJsonContains('district_ids', $assigned[0]);
                foreach (array_slice($assigned, 1) as $dId) {
                    $q->orWhereJsonContains('district_ids', $dId);
                }
            });
        }

        $pendingVendors = $query->get()->map(function ($vendor) {
            $selectedDistrictIds = $vendor->district_ids ?: ($vendor->district_id ? [$vendor->district_id] : []);
            $vendor->selected_districts = District::whereIn('id', $selectedDistrictIds)->get(['id', 'name']);
            return $vendor;
        });

        $verifiedQuery = Vendor::where('kyc_status', 'verified')
            ->with(['district', 'user'])
            ->orderBy('updated_at', 'desc');

        if ($user && $user->isDistrictAdmin() && !empty($user->assigned_district_ids)) {
            $verifiedQuery->whereIn('district_id', $user->assigned_district_ids);
        }

        $verifiedVendors = $verifiedQuery->take(10)->get()->map(function ($vendor) {
            $approvedIds = $vendor->approved_district_ids ?: ($vendor->district_id ? [$vendor->district_id] : []);
            $vendor->approved_districts_list = District::whereIn('id', $approvedIds)->pluck('name')->toArray();
            return $vendor;
        });

        return Inertia::render('Admin/Kyc/Index', [
            'pendingVendors' => $pendingVendors,
            'verifiedVendors' => $verifiedVendors,
            'pendingCount' => Vendor::pendingKycCount(),
        ]);
    }

    /**
     * Request changes / corrections on a vendor's KYC application.
     */
    public function requestChanges(Request $request, $id): RedirectResponse
    {
        $vendor = Vendor::with('user')->findOrFail($id);

        $request->validate([
            'checklist_items' => 'required|array|min:1',
            'checklist_items.*' => 'string',
            'admin_notes' => 'nullable|string|max:1500',
            'deadline_days' => 'nullable|integer|min:1|max:30',
        ]);

        $days = (int) ($request->deadline_days ?: 7);
        $deadline = now()->addDays($days);
        $checklistItems = $request->checklist_items;

        $vendor->update([
            'kyc_status' => 'needs_correction',
            'status' => 'needs_correction',
            'correction_deadline' => $deadline,
            'correction_flagged_fields' => $checklistItems,
            'correction_attempts' => ($vendor->correction_attempts ?? 0) + 1,
            'admin_notes' => $request->admin_notes ?? $vendor->admin_notes,
            'kyc_reviewed_at' => now(),
        ]);

        // Create message history record
        \App\Models\VerificationMessage::create([
            'vendor_id' => $vendor->id,
            'sender_id' => auth()->id(),
            'sender_role' => 'admin',
            'type' => 'request_changes',
            'checklist_items' => $checklistItems,
            'note' => $request->admin_notes,
            'deadline_at' => $deadline,
        ]);

        AuditLog::log(
            'kyc_changes_requested',
            'vendor',
            $vendor->id,
            "Officer requested changes on KYC for {$vendor->business_name}. Flagged items: " . implode(', ', $checklistItems) . ". Deadline: {$days} days."
        );

        // Send queued email notification to vendor with general guidance (NO sensitive Aadhaar details)
        try {
            if ($vendor->user) {
                $vendor->user->notify(new \App\Notifications\VendorKycCorrectionNotification(
                    $vendor,
                    $checklistItems,
                    $request->admin_notes,
                    $deadline->format('d M Y')
                ));
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Could not dispatch KYC correction notification: " . $e->getMessage());
        }

        return back()->with('success', "Changes requested for {$vendor->business_name}. Vendor notified to resubmit within {$days} days.");
    }

    public function approve(Request $request, $id): RedirectResponse
    {
        $vendor = Vendor::with('user')->findOrFail($id);
        
        $request->validate([
            'approved_district_ids' => 'nullable|array',
            'approved_district_ids.*' => 'exists:districts,id',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        // Default to chosen district IDs if none explicitly checked
        $requestedDistricts = $request->approved_district_ids;
        if (empty($requestedDistricts)) {
            $requestedDistricts = $vendor->district_ids ?: [$vendor->district_id];
        }
        $requestedDistricts = array_values(array_map('intval', (array) $requestedDistricts));

        // Hard cap at 2 districts on the server
        $approvedDistricts = array_slice($requestedDistricts, 0, 2);

        $vendor->update([
            'kyc_status' => 'verified',
            'status' => 'active',
            'approved_district_ids' => $approvedDistricts,
            'district_id' => $approvedDistricts[0] ?? $vendor->district_id,
            'kyc_reviewed_at' => now(),
            'trust_score' => max($vendor->trust_score, 0.880),
            'admin_notes' => $request->admin_notes ?? $vendor->admin_notes,
        ]);

        // Create message record for approval
        \App\Models\VerificationMessage::create([
            'vendor_id' => $vendor->id,
            'sender_id' => auth()->id(),
            'sender_role' => 'admin',
            'type' => 'approval',
            'note' => $request->admin_notes ?? 'Partner credentials verified and approved for live bookings.',
        ]);

        // Sync vendor_districts pivot table
        $allRequested = $vendor->district_ids ?: [$vendor->district_id];
        foreach ($allRequested as $dId) {
            $isApproved = in_array((int)$dId, $approvedDistricts);
            VendorDistrict::updateOrCreate(
                ['vendor_id' => $vendor->id, 'district_id' => $dId],
                [
                    'status' => $isApproved ? 'approved' : 'rejected',
                    'reviewed_at' => now(),
                    'reviewed_by' => auth()->id(),
                ]
            );
        }

        $approvedDistrictNames = District::whereIn('id', $approvedDistricts)->pluck('name')->toArray();
        $districtsSummary = !empty($approvedDistrictNames) ? implode(', ', $approvedDistrictNames) : 'Tamil Nadu';

        AuditLog::log(
            'kyc_approved',
            'vendor',
            $vendor->id,
            "Officer approved partner credentials for {$vendor->business_name} for districts: {$districtsSummary}."
        );

        // Send queued email notification to vendor
        try {
            if ($vendor->user) {
                $vendor->user->notify(new VendorKycStatusNotification($vendor, 'approved', null, $approvedDistrictNames));
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Could not dispatch KYC approval email: " . $e->getMessage());
        }

        return back()->with('success', "Partner verified and approved for {$vendor->business_name} in: {$districtsSummary}!");
    }

    public function reject(Request $request, $id): RedirectResponse
    {
        $vendor = Vendor::with('user')->findOrFail($id);
        
        $request->validate([
            'rejection_reason_type' => 'nullable|string',
            'rejection_notes' => 'nullable|string|max:1000',
            'rejection_reason' => 'nullable|string|max:1000',
        ]);

        $reason = $request->rejection_reason;
        if (empty($reason)) {
            $reasonType = $request->rejection_reason_type ?: 'Incomplete or invalid documents';
            $notes = $request->rejection_notes;
            $reason = $notes ? "{$reasonType} — {$notes}" : $reasonType;
        }

        $vendor->update([
            'kyc_status' => 'rejected',
            'status' => 'rejected',
            'kyc_rejected_reason' => $reason,
            'kyc_reviewed_at' => now(),
        ]);

        // Create message record for rejection
        \App\Models\VerificationMessage::create([
            'vendor_id' => $vendor->id,
            'sender_id' => auth()->id(),
            'sender_role' => 'admin',
            'type' => 'rejection',
            'note' => $reason,
        ]);

        // Update all vendor_districts pivot rows to rejected
        VendorDistrict::where('vendor_id', $vendor->id)->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
        ]);

        AuditLog::log(
            'kyc_rejected',
            'vendor',
            $vendor->id,
            "Officer rejected KYC for {$vendor->business_name}. Reason: {$reason}"
        );

        // Send queued email notification to vendor with rejection reason
        try {
            if ($vendor->user) {
                $vendor->user->notify(new VendorKycStatusNotification($vendor, 'rejected', $reason));
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Could not dispatch KYC rejection email: " . $e->getMessage());
        }

        return back()->with('success', "KYC submission rejected for {$vendor->business_name}. Notification dispatched.");
    }
}
