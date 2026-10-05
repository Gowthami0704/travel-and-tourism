<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\FraudFlag;
use App\Models\Listing;
use App\Models\Review;
use App\Models\Vendor;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TrustScoreService
{
    /**
     * Calculate all 11 behavioral features and score vendor via FastAPI Isolation Forest microservice
     */
    public function calculateAndScoreVendor(Vendor $vendor): array
    {
        $ageDays = max(1.0, (float) $vendor->created_at->diffInDays(now()));
        $districtName = $vendor->district?->name ?? 'General';

        // 1. Pricing Baseline & Deviation
        $vendorAvgPrice = (float) ($vendor->listings()->avg('price') ?? ($vendor->pricing_declaration['min_price'] ?? 1500.0));
        $districtAvgPrice = (float) (Listing::whereHas('vendor', function ($q) use ($vendor) {
            $q->where('district_id', $vendor->district_id);
        })->avg('price') ?? 1500.0);

        $priceDeviation = $districtAvgPrice > 0 ? ($vendorAvgPrice - $districtAvgPrice) / $districtAvgPrice : 0.0;

        // 2. Bookings & Cancellation Rate
        $totalBookings = (int) $vendor->bookings()->count();
        $cancelledBookings = (int) $vendor->bookings()->where('bookings.status', 'cancelled')->count();
        $cancellationRate = $totalBookings > 0 ? round($cancelledBookings / $totalBookings, 3) : 0.02;

        // 3. Reviews, Rating & Negative Sentiment
        $totalReviews = (int) $vendor->reviews()->count();
        $avgRating = (float) ($vendor->reviews()->avg('rating') ?? 4.6);
        $negativeReviews = (int) $vendor->reviews()->where('rating', '<=', 2)->count();
        $negReviewPct = $totalReviews > 0 ? round($negativeReviews / $totalReviews, 3) : 0.0;

        // 4. KYC Status
        $kycStatus = $vendor->kyc_status === 'verified' ? 1.0 : ($vendor->kyc_status === 'pending' ? 0.5 : 0.0);

        // 5. Response Time Tier (mins)
        $respTier = $vendor->policies['response_time'] ?? 'under_15m';
        $respTimeAvg = match ($respTier) {
            'under_15m' => 15.0,
            '1_hour' => 60.0,
            'same_day' => 360.0,
            default => 30.0,
        };

        // 6. Complaints & Refunds
        $complaintCount = (int) FraudFlag::where('vendor_id', $vendor->id)->where('resolved', false)->count();
        $refundRequests = (int) $vendor->bookings()->where('bookings.status', 'refunded')->count();

        // Build Complete 11-Feature Vector
        $featureVector = [
            'vendor_id' => $vendor->id,
            'district' => $districtName,
            'avg_price' => round($vendorAvgPrice, 2),
            'price_deviation' => round($priceDeviation, 3),
            'total_bookings' => $totalBookings,
            'cancellation_rate' => $cancellationRate,
            'avg_review_rating' => round($avgRating, 2),
            'negative_review_percentage' => $negReviewPct,
            'kyc_status' => $kycStatus,
            'account_age_days' => $ageDays,
            'response_time_avg' => $respTimeAvg,
            'refund_requests_count' => $refundRequests,
            'complaint_count' => $complaintCount,
        ];

        // Call FastAPI AI Microservice (127.0.0.1:8001)
        try {
            $response = Http::timeout(3)->post('http://127.0.0.1:8001/predict-trust', $featureVector);
            if ($response->successful()) {
                $result = $response->json();
                $trustScore = (float) ($result['trust_score'] ?? 0.85);
                $flag = $result['flag'] ?? 'safe';

                $vendor->update(['trust_score' => $trustScore]);

                if (($flag === 'flagged' || $flag === 'suspicious') && $complaintCount === 0) {
                    FraudFlag::firstOrCreate(
                        ['vendor_id' => $vendor->id, 'resolved' => false],
                        [
                            'reason' => "AI Isolation Forest Anomaly: Price Dev " . round($priceDeviation * 100) . "%, Trust " . round($trustScore * 100) . "%",
                            'severity' => $flag === 'flagged' ? 'high' : 'medium',
                            'resolved' => false,
                        ]
                    );
                }

                return [
                    'trust_score' => $trustScore,
                    'flag' => $flag,
                    'source' => 'fastapi_isolation_forest',
                    'features' => $featureVector,
                ];
            }
        } catch (\Throwable $e) {
            Log::info("AI Microservice fallback engaged: " . $e->getMessage());
        }

        // Statistical Fallback Scorer (Deterministic)
        $base = 0.88;
        if ($kycStatus === 0.0) $base -= 0.15;
        if (abs($priceDeviation) > 0.6) $base -= 0.20;
        if ($avgRating < 3.2) $base -= 0.25;
        if ($cancellationRate > 0.3) $base -= 0.20;
        if ($complaintCount > 0) $base -= ($complaintCount * 0.15);

        $trustScore = max(0.15, min(0.98, round($base, 3)));
        $flag = $trustScore >= 0.70 ? 'safe' : ($trustScore >= 0.45 ? 'suspicious' : 'flagged');

        $vendor->update(['trust_score' => $trustScore]);

        return [
            'trust_score' => $trustScore,
            'flag' => $flag,
            'source' => 'statistical_fallback',
            'features' => $featureVector,
        ];
    }
}

