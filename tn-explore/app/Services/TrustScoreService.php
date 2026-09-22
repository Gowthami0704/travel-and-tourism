<?php

namespace App\Services;

use App\Models\FraudFlag;
use App\Models\Listing;
use App\Models\Vendor;
use Illuminate\Support\Facades\Http;

class TrustScoreService
{
    /**
     * Calculate features and call Python FastAPI Isolation Forest microservice
     */
    public function calculateAndScoreVendor(Vendor $vendor): array
    {
        $ageDays = max(1, (int) $vendor->created_at->diffInDays(now()));
        $listingCount = $vendor->listings()->count();
        $avgRating = (float) ($vendor->reviews()->avg('rating') ?? 4.2);
        $reviewCount = $vendor->reviews()->count();
        $reviewVelocity = round($reviewCount / max(1, $ageDays / 30), 2);
        
        // Price deviation check
        $vendorAvgPrice = $vendor->listings()->avg('price') ?? 1500;
        $districtAvgPrice = Listing::whereHas('vendor', function ($q) use ($vendor) {
            $q->where('district_id', $vendor->district_id);
        })->avg('price') ?? 1500;

        $priceDeviation = $districtAvgPrice > 0 ? abs(($vendorAvgPrice - $districtAvgPrice) / $districtAvgPrice) : 0.0;
        $complaintCount = FraudFlag::where('vendor_id', $vendor->id)->where('resolved', false)->count();

        $features = [
            'vendor_age_days' => $ageDays,
            'listing_count' => $listingCount,
            'avg_rating' => $avgRating,
            'review_velocity' => $reviewVelocity,
            'price_deviation' => round($priceDeviation, 2),
            'complaint_count' => $complaintCount,
        ];

        // Attempt Python FastAPI AI Microservice
        try {
            $response = Http::timeout(3)->post('http://127.0.0.1:8001/predict-trust', $features);
            if ($response->successful()) {
                $result = $response->json();
                $trustScore = (float) $result['trust_score'];
                $flag = $result['flag'];

                $vendor->update(['trust_score' => $trustScore]);

                if ($flag === 'flagged' || $flag === 'suspicious') {
                    FraudFlag::firstOrCreate(
                        [
                            'vendor_id' => $vendor->id,
                            'reason' => "AI Anomaly detected: Price dev {$priceDeviation}, Trust score {$trustScore}",
                        ],
                        [
                            'severity' => $flag === 'flagged' ? 'high' : 'medium',
                            'resolved' => false,
                        ]
                    );
                }

                return ['trust_score' => $trustScore, 'flag' => $flag, 'source' => 'fastapi_isolation_forest'];
            }
        } catch (\Exception $e) {
            // Microservice offline -> use local Isolation Forest statistical heuristic
        }

        // Fallback Isolation Forest rule-based simulation
        $base = 0.85;
        if ($ageDays < 3 && $priceDeviation > 0.6) $base -= 0.35;
        if ($avgRating < 3.0) $base -= 0.25;
        if ($complaintCount > 0) $base -= ($complaintCount * 0.2);
        if ($vendor->status === 'pending') $base = min(0.75, $base);

        $trustScore = max(0.15, min(0.99, round($base, 3)));
        $flag = $trustScore > 0.60 ? 'safe' : ($trustScore > 0.35 ? 'suspicious' : 'flagged');

        $vendor->update(['trust_score' => $trustScore]);

        if (($flag === 'flagged' || $flag === 'suspicious') && $complaintCount === 0) {
            FraudFlag::firstOrCreate(
                ['vendor_id' => $vendor->id, 'reason' => "Abnormal pricing pattern or unverified profile"],
                ['severity' => 'medium', 'resolved' => false]
            );
        }

        return ['trust_score' => $trustScore, 'flag' => $flag, 'source' => 'heuristic_model'];
    }
}
