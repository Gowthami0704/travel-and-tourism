<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Vendor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_name',
        'owner_name',
        'slug',
        'service_type',
        'specialties',
        'district_id',
        'description',
        'logo_url',
        'license_url',
        'gst_number',
        'phone',
        'status',
        'kyc_status',
        'trust_score',
    ];

    protected $casts = [
        'trust_score' => 'float',
        'specialties' => 'array',
    ];

    protected $appends = [
        'ai_trust_breakdown',
    ];

    protected static function booted()
    {
        static::creating(function ($vendor) {
            if (empty($vendor->slug)) {
                $baseSlug = Str::slug($vendor->business_name);
                $slug = $baseSlug;
                $counter = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $counter++;
                }
                $vendor->slug = $slug;
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function listings()
    {
        return $this->hasMany(Listing::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function fraudFlags()
    {
        return $this->hasMany(FraudFlag::class);
    }

    public function bookings()
    {
        return $this->hasManyThrough(Booking::class, Listing::class);
    }

    public function isVerified(): bool
    {
        return $this->kyc_status === 'verified' || $this->status === 'active';
    }

    public function getAiTrustBreakdownAttribute(): array
    {
        // 1. Profile Completeness (30%)
        $completenessScore = 0;
        if (!empty($this->business_name)) $completenessScore += 6;
        if (!empty($this->description)) $completenessScore += 6;
        if (!empty($this->phone)) $completenessScore += 6;
        if (!empty($this->district_id)) $completenessScore += 6;
        if (!empty($this->specialties) && count($this->specialties) > 0) $completenessScore += 6;
        $profilePercent = min(30, $completenessScore);

        // 2. KYC Verification (30%)
        $kycPercent = 5;
        if ($this->kyc_status === 'verified') {
            $kycPercent = 30;
        } elseif ($this->kyc_status === 'pending' || !empty($this->license_url)) {
            $kycPercent = 20;
        }

        // 3. User Reviews / Rating (40%)
        $avgRating = $this->reviews()->avg('rating');
        if ($avgRating === null || $avgRating == 0) {
            $ratingPercent = 32; // Baseline trust for new vendor
        } else {
            $ratingPercent = round(($avgRating / 5.0) * 40, 1);
        }

        $totalScore = round(($profilePercent + $kycPercent + $ratingPercent) / 100, 3);

        return [
            'total' => $totalScore,
            'percent' => round($totalScore * 100),
            'profile_completeness' => $profilePercent,
            'kyc_score' => $kycPercent,
            'rating_score' => $ratingPercent,
            'avg_rating' => $avgRating ? round($avgRating, 1) : 4.8,
            'total_reviews' => $this->reviews()->count(),
        ];
    }
}

