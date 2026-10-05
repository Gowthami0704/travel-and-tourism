<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\District;
use App\Models\FraudFlag;
use App\Models\Vendor;
use App\Models\VendorVerificationMessage;
use App\Services\VendorAnomalyScanner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FraudController extends Controller
{
    protected VendorAnomalyScanner $scanner;

    public function __construct(VendorAnomalyScanner $scanner)
    {
        $this->scanner = $scanner;
    }

    public function index(Request $request): Response
    {
        $selectedDistrict = $request->query('district', 'all');

        $query = Vendor::with(['district', 'reviews', 'fraudFlags']);
        if ($selectedDistrict !== 'all' && is_numeric($selectedDistrict)) {
            $districtId = (int) $selectedDistrict;
            $query->where(function ($q) use ($districtId) {
                $q->where('district_id', $districtId)
                  ->orWhereJsonContains('approved_district_ids', $districtId)
                  ->orWhereJsonContains('district_ids', $districtId);
            });
        }

        $allVendors = $query->get();

        // If vendors have never been scanned with the hybrid scanner, perform initial scan
        $needsInitialScan = $allVendors->whereNull('last_scanned_at')->count() > 0;
        if ($needsInitialScan) {
            $this->scanner->scanAllVendors();
            $allVendors = $query->get();
        }

        $vendors = $allVendors->map(function ($v) {
            $ageDays = $v->created_at ? $v->created_at->diffInDays(now()) : 0;
            $bookingsCount = \App\Models\Booking::whereHas('listing', fn($q) => $q->where('vendor_id', $v->id))->count();

            // Calculate score if not set
            $score = $v->fraud_risk_score ?? 15;
            $ifScore = $v->isolation_forest_score ?? 0.05;
            $hardScore = $v->hard_rule_score ?? 0;
            $topReasons = $v->top_risk_reasons ?? [];

            if ($v->scan_status === 'insufficient_data' || ($ageDays < 30 || $bookingsCount < 5)) {
                $tier = 'insufficient_data';
                $calculatedScore = min(35, (int) ($hardScore * 0.4));
            } else {
                $calculatedScore = min(100, (int) round(($ifScore * 50) + min(50, $hardScore)));
                if ($calculatedScore >= 65) {
                    $tier = 'high';
                } elseif ($calculatedScore >= 35) {
                    $tier = 'medium';
                } else {
                    $tier = 'safe';
                }
            }

            $v->calculated_fraud_score = $calculatedScore;
            $v->risk_tier = $tier;
            $v->top_risk_reasons = $topReasons;
            $v->bookings_count = $bookingsCount;
            $v->account_age_days = $ageDays;

            return $v;
        });

        $highRiskVendors = $vendors->where('risk_tier', 'high')->values();
        $moderateRiskVendors = $vendors->where('risk_tier', 'medium')->values();
        $lowRiskVendors = $vendors->where('risk_tier', 'safe')->values();
        $insufficientDataVendors = $vendors->where('risk_tier', 'insufficient_data')->values();

        $openFraudFlags = FraudFlag::where('resolved', false)
            ->with('vendor.district')
            ->orderBy('created_at', 'desc')
            ->get();

        $districts = District::orderBy('name')->get(['id', 'name']);
        $totalDistrictsCount = 38; // Official Tamil Nadu districts count
        $totalStatewideVendors = Vendor::count();

        $modelMetrics = $this->scanner->getBenchmarkMetrics();

        return Inertia::render('Admin/Fraud/Index', [
            'allVendors' => $vendors->values(),
            'highRiskVendors' => $highRiskVendors,
            'moderateRiskVendors' => $moderateRiskVendors,
            'lowRiskVendors' => $lowRiskVendors,
            'insufficientDataVendors' => $insufficientDataVendors,
            'openFraudFlags' => $openFraudFlags,
            'districts' => $districts,
            'selectedDistrict' => $selectedDistrict,
            'totalScanned' => $vendors->count(),
            'totalStatewide' => $totalStatewideVendors,
            'totalDistricts' => $totalDistrictsCount,
            'modelCard' => $modelMetrics,
        ]);
    }

    public function scanVendors(Request $request): RedirectResponse
    {
        $districtId = $request->input('district_id');
        $vendorId = $request->input('vendor_id');
        $vendorIds = $request->input('vendor_ids');

        if (!empty($vendorIds) && is_array($vendorIds)) {
            $targetVendors = Vendor::whereIn('id', $vendorIds)->get();
            $scannedCount = 0;
            foreach ($targetVendors as $v) {
                $this->scanner->scanVendor($v);
                $scannedCount++;
            }
            $targetName = "{$scannedCount} Selected Operator(s)";
        } elseif (!empty($vendorId)) {
            $vendor = Vendor::findOrFail($vendorId);
            $this->scanner->scanVendor($vendor);
            $targetName = "Operator: {$vendor->business_name}";
            $scannedCount = 1;
        } else {
            $distParam = (!empty($districtId) && $districtId !== 'all') ? (int) $districtId : null;
            $res = $this->scanner->scanAllVendors($distParam);
            $scannedCount = $res['scanned_count'];
            $districtObj = $distParam ? District::find($distParam) : null;
            $targetName = $districtObj ? "District: {$districtObj->name}" : "Statewide (All 38 Districts)";
        }

        AuditLog::log('ai_fraud_scan_executed', 'system', null, "Scanned {$scannedCount} vendor(s) ({$targetName}) with Isolation Forest hybrid model.");

        return back()->with('success', "Hybrid AI Anomaly Scan completed for {$scannedCount} operator(s) [{$targetName}].");
    }

    public function resolve(Request $request, $id): RedirectResponse
    {
        $flag = FraudFlag::findOrFail($id);
        $flag->update([
            'resolved' => true,
            'admin_action' => 'resolved',
            'actioned_at' => now(),
            'actioned_by' => auth()->id() ?? 1,
        ]);

        AuditLog::log('fraud_flag_resolved', 'vendor', $flag->vendor_id, "Admin resolved anomaly flag #{$flag->id}");

        return back()->with('success', "Anomaly flag #{$flag->id} marked as resolved.");
    }

    public function dismiss(Request $request, $id): RedirectResponse
    {
        $request->validate([
            'reason' => 'required|string|min:5|max:500',
        ]);

        $flag = FraudFlag::findOrFail($id);
        $flag->update([
            'resolved' => true,
            'admin_action' => 'dismissed',
            'dismissed_reason' => $request->input('reason'),
            'actioned_at' => now(),
            'actioned_by' => auth()->id() ?? 1,
        ]);

        AuditLog::log('fraud_flag_dismissed', 'vendor', $flag->vendor_id, "Admin dismissed anomaly #{$flag->id}. Reason: {$request->input('reason')}");

        return back()->with('success', "Anomaly dismissed with logged justification.");
    }

    public function warn(Request $request, $id): RedirectResponse
    {
        $request->validate([
            'note' => 'nullable|string|max:500',
        ]);

        $flag = FraudFlag::findOrFail($id);
        $flag->update([
            'admin_action' => 'warned',
            'action_note' => $request->input('note', 'Official warning issued regarding operational compliance and booking stability.'),
            'actioned_at' => now(),
            'actioned_by' => auth()->id() ?? 1,
        ]);

        // Send message to vendor communication channel if available
        if (class_exists(VendorVerificationMessage::class)) {
            VendorVerificationMessage::create([
                'vendor_id' => $flag->vendor_id,
                'sender_type' => 'admin',
                'sender_id' => auth()->id() ?? 1,
                'message' => "Official System Notice: Anomaly detected in your operational metrics ({$flag->reason}). " . ($request->input('note') ?? 'Please review your booking handling to maintain good standing.'),
                'is_read' => false,
            ]);
        }

        AuditLog::log('fraud_warning_issued', 'vendor', $flag->vendor_id, "Official warning issued for anomaly #{$flag->id}");

        return back()->with('success', "Warning notice dispatched to operator.");
    }

    public function requestInfo(Request $request, $id): RedirectResponse
    {
        $request->validate([
            'message' => 'required|string|min:5|max:1000',
            'deadline_days' => 'nullable|integer|min:1|max:30',
        ]);

        $flag = FraudFlag::findOrFail($id);
        $deadlineDays = $request->input('deadline_days', 7);

        $flag->update([
            'admin_action' => 'info_requested',
            'action_note' => $request->input('message'),
            'action_deadline' => now()->addDays($deadlineDays),
            'actioned_at' => now(),
            'actioned_by' => auth()->id() ?? 1,
        ]);

        if (class_exists(VendorVerificationMessage::class)) {
            VendorVerificationMessage::create([
                'vendor_id' => $flag->vendor_id,
                'sender_type' => 'admin',
                'sender_id' => auth()->id() ?? 1,
                'message' => "Compliance Information Request (Deadline: {$deadlineDays} days): " . $request->input('message'),
                'is_read' => false,
            ]);
        }

        AuditLog::log('fraud_info_requested', 'vendor', $flag->vendor_id, "Admin requested clarification from vendor regarding flag #{$flag->id}");

        return back()->with('success', "Information request sent to vendor with {$deadlineDays}-day response window.");
    }

    public function suspend(Request $request, $id): RedirectResponse
    {
        $request->validate([
            'confirmation' => 'required|accepted',
            'reason' => 'required|string|min:5|max:500',
        ]);

        $flag = FraudFlag::findOrFail($id);
        $vendor = $flag->vendor;

        $vendor->update([
            'status' => 'suspended',
            'admin_notes' => 'Suspended by admin due to fraud anomaly: ' . $request->input('reason'),
        ]);

        $flag->update([
            'admin_action' => 'suspended',
            'action_note' => $request->input('reason'),
            'actioned_at' => now(),
            'actioned_by' => auth()->id() ?? 1,
        ]);

        AuditLog::log('vendor_suspended_for_fraud', 'vendor', $vendor->id, "Admin suspended vendor {$vendor->business_name}. Reason: {$request->input('reason')}");

        return back()->with('success', "Vendor account '{$vendor->business_name}' has been suspended.");
    }

    public function overrideScore(Request $request, $vendorId): RedirectResponse
    {
        $vendor = Vendor::findOrFail($vendorId);
        $request->validate([
            'score' => 'required|integer|min:0|max:100',
            'reason' => 'required|string|max:500',
        ]);

        $vendor->update([
            'fraud_risk_score' => $request->score,
            'hard_rule_score' => $request->score,
            'admin_notes' => "Admin override: " . $request->reason,
            'trust_score' => max(0.1, round((100 - $request->score) / 100, 2)),
        ]);

        AuditLog::log(
            'fraud_score_manual_override',
            'vendor',
            $vendor->id,
            "Manually set fraud score to {$request->score}. Reason: {$request->reason}"
        );

        return back()->with('success', "Fraud risk profile updated for {$vendor->business_name}.");
    }
}
