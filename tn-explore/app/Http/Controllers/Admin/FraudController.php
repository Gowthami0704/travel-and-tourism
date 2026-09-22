<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\FraudFlag;
use App\Models\Review;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FraudController extends Controller
{
    public function index(): Response
    {
        // Auto-evaluate fraud risk for all vendors
        $vendors = Vendor::with(['district', 'reviews', 'fraudFlags'])->get()->map(function ($v) {
            $scoreData = $this->calculateFraudScore($v);
            $v->calculated_fraud_score = $scoreData['score'];
            $v->calculated_fraud_reason = $scoreData['reason'];
            $v->fraud_factors = $scoreData['factors'];
            return $v;
        });

        $highRiskVendors = $vendors->where('calculated_fraud_score', '>=', 50)->values();
        $moderateRiskVendors = $vendors->whereBetween('calculated_fraud_score', [30, 49])->values();
        $lowRiskVendors = $vendors->where('calculated_fraud_score', '<', 30)->values();

        $openFraudFlags = FraudFlag::where('status', 'open')->with('vendor.district')->get();

        return Inertia::render('Admin/Fraud/Index', [
            'highRiskVendors' => $highRiskVendors,
            'moderateRiskVendors' => $moderateRiskVendors,
            'lowRiskVendors' => $lowRiskVendors,
            'openFraudFlags' => $openFraudFlags,
            'totalScanned' => $vendors->count(),
        ]);
    }

    public function scanVendors(): RedirectResponse
    {
        $vendors = Vendor::with('reviews')->get();
        $flaggedCount = 0;

        foreach ($vendors as $v) {
            $scoreData = $this->calculateFraudScore($v);
            $v->update([
                'fraud_risk_score' => $scoreData['score'],
                'fraud_risk_reason' => $scoreData['reason'],
            ]);

            if ($scoreData['score'] >= 60) {
                FraudFlag::updateOrCreate(
                    ['vendor_id' => $v->id, 'status' => 'open'],
                    [
                        'reason' => $scoreData['reason'],
                        'severity' => $scoreData['score'] > 75 ? 'critical' : 'high',
                        'flagged_at' => now(),
                    ]
                );
                $flaggedCount++;
            }
        }

        AuditLog::log('ai_fraud_scan_executed', 'system', null, "Scanned {$vendors->count()} vendors. {$flaggedCount} high risk anomalies flagged.");

        return back()->with('success', "AI Fraud Scan completed across {$vendors->count()} vendors! {$flaggedCount} anomalies detected.");
    }

    public function resolve(Request $request, $id): RedirectResponse
    {
        $flag = FraudFlag::findOrFail($id);
        $flag->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);

        AuditLog::log('fraud_flag_resolved', 'vendor', $flag->vendor_id, "Admin resolved fraud anomaly #{$flag->id}");

        return back()->with('success', "Fraud flag #{$flag->id} marked as resolved.");
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
            'fraud_risk_reason' => "Admin override: " . $request->reason,
        ]);

        AuditLog::log(
            'fraud_score_manual_override',
            'vendor',
            $vendor->id,
            "Manually set fraud score to {$request->score}. Reason: {$request->reason}"
        );

        return back()->with('success', "Fraud score overridden for {$vendor->business_name}.");
    }

    private function calculateFraudScore(Vendor $vendor): array
    {
        $factors = [];
        $score = 0;

        // Factor 1: Complaints / open flags (x 10)
        $complaintsCount = FraudFlag::where('vendor_id', $vendor->id)->count();
        if ($complaintsCount > 0) {
            $complaintsPenalty = $complaintsCount * 10;
            $score += $complaintsPenalty;
            $factors[] = "{$complaintsCount} complaints filed (+{$complaintsPenalty} pts)";
        }

        // Factor 2: Refund / cancellation requests (x 5)
        $cancelledBookings = Booking::whereHas('listing', fn($q) => $q->where('vendor_id', $vendor->id))
            ->where('status', 'cancelled')
            ->count();
        if ($cancelledBookings > 0) {
            $refundPenalty = $cancelledBookings * 5;
            $score += $refundPenalty;
            $factors[] = "{$cancelledBookings} cancelled/refund requests (+{$refundPenalty} pts)";
        }

        // Factor 3: Negative reviews (< 3 stars) (x 0.5%)
        $totalReviews = $vendor->reviews()->count();
        if ($totalReviews > 0) {
            $negativeReviews = $vendor->reviews()->where('rating', '<=', 2)->count();
            $negPercent = round(($negativeReviews / $totalReviews) * 100);
            if ($negPercent > 0) {
                $reviewPenalty = round($negPercent * 0.5);
                $score += $reviewPenalty;
                $factors[] = "{$negPercent}% negative reviews (+{$reviewPenalty} pts)";
            }
        }

        // Factor 4: KYC Incompleteness Penalty (+20)
        if ($vendor->kyc_status !== 'verified') {
            $score += 20;
            $factors[] = "Unverified KYC documentation (+20 pts)";
        }

        // Factor 5: Account age penalty for new accounts (< 7 days) (+15)
        if ($vendor->created_at && $vendor->created_at->diffInDays(now()) < 7) {
            $score += 15;
            $factors[] = "New partner account (< 7 days) (+15 pts)";
        }

        $finalScore = min(100, max(0, $score));
        $reason = empty($factors) ? "Clean operational history & verified documents" : implode("; ", $factors);

        return [
            'score' => $finalScore,
            'reason' => $reason,
            'factors' => $factors,
        ];
    }
}
