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
        'business_type',
        'operating_years',
        'online_presence_url',
        'service_details',
        'pricing_declaration',
        'policies',
        'references',
        'declarations_accepted',
        'specialties',
        'district_id',
        'district_ids',
        'approved_district_ids',
        'services',
        'state_id',
        'state_name',
        'area',
        'address',
        'description',
        'logo_url',
        'profile_photo_url',
        'business_photos',
        'license_url',
        'tourism_license_path',
        'aadhaar_document_path',
        'gstin_document_path',
        'selfie_document_path',
        'gst_number',
        'aadhaar_masked',
        'pan_masked',
        'phone',
        'phone_verified_at',
        'status',
        'kyc_status',
        'kyc_rejected_reason',
        'correction_deadline',
        'correction_attempts',
        'correction_flagged_fields',
        'last_resubmitted_at',
        'resubmission_diff',
        'trust_score',
        'precheck_flags',
        'kyc_reviewed_at',
        'admin_notes',
        'isolation_forest_score',
        'hard_rule_score',
        'risk_tier',
        'top_risk_reasons',
        'scan_status',
        'last_scanned_at',
    ];

    protected $casts = [
        'trust_score' => 'float',
        'isolation_forest_score' => 'float',
        'hard_rule_score' => 'float',
        'top_risk_reasons' => 'array',
        'last_scanned_at' => 'datetime',
        'specialties' => 'array',
        'district_ids' => 'array',
        'approved_district_ids' => 'array',
        'services' => 'array',
        'business_photos' => 'array',
        'service_details' => 'array',
        'pricing_declaration' => 'array',
        'policies' => 'array',
        'references' => 'array',
        'precheck_flags' => 'array',
        'correction_flagged_fields' => 'array',
        'resubmission_diff' => 'array',
        'correction_attempts' => 'integer',
        'declarations_accepted' => 'boolean',
        'kyc_reviewed_at' => 'datetime',
        'correction_deadline' => 'datetime',
        'last_resubmitted_at' => 'datetime',
        'phone_verified_at' => 'datetime',
    ];

    protected $appends = [
        'ai_trust_breakdown',
        'trust_tier',
        'display_trust_score',
        'public_location',
        'approved_district_names',
        'can_create_packages',
        'is_guide_only',
        'can_request_district_change',
        'duplicate_flags',
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

    public function vendorDistricts()
    {
        return $this->hasMany(VendorDistrict::class);
    }

    public function districtChangeRequests()
    {
        return $this->hasMany(DistrictChangeRequest::class);
    }

    public function availabilities()
    {
        return $this->hasMany(VendorAvailability::class);
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

    public function proposals()
    {
        return $this->hasMany(TripProposal::class);
    }

    public function chats()
    {
        return $this->hasMany(TripChat::class);
    }

    public function verificationMessages()
    {
        return $this->hasMany(VerificationMessage::class)->orderBy('created_at', 'desc');
    }

    public function scopePendingKyc($query)
    {
        return $query->where(function ($q) {
            $q->whereIn('kyc_status', ['pending', 'resubmitted'])
              ->orWhereIn('status', ['pending', 'pending_review', 'resubmitted']);
        })
        ->whereNotIn('kyc_status', ['verified', 'rejected', 'needs_correction'])
        ->whereNotIn('status', ['active', 'rejected', 'banned', 'suspended', 'needs_correction'])
        ->whereHas('user', function ($u) {
            $u->whereNotNull('email_verified_at');
        });
    }

    public static function pendingKycCount(): int
    {
        return static::pendingKyc()->count();
    }

    public function isVerified(): bool
    {
        return $this->kyc_status === 'verified' && $this->status === 'active';
    }

    public function isNeedsCorrection(): bool
    {
        return $this->kyc_status === 'needs_correction' || $this->status === 'needs_correction';
    }

    public function isResubmitted(): bool
    {
        return $this->kyc_status === 'resubmitted' || $this->status === 'resubmitted';
    }

    public function getDuplicateFlagsAttribute(): array
    {
        $flags = [];

        // Check duplicate phone
        if ($this->phone) {
            $duplicatePhoneCount = static::where('id', '!=', $this->id)
                ->where('phone', $this->phone)
                ->count();
            if ($duplicatePhoneCount > 0) {
                $flags[] = "Duplicate phone number detected ({$duplicatePhoneCount} other partner account)";
            }
        }

        // Check duplicate GSTIN
        if ($this->gst_number && strtoupper($this->gst_number) !== 'NOT PROVIDED') {
            $duplicateGstCount = static::where('id', '!=', $this->id)
                ->where('gst_number', $this->gst_number)
                ->count();
            if ($duplicateGstCount > 0) {
                $flags[] = "Duplicate GSTIN number ({$duplicateGstCount} other partner account)";
            }
        }

        // Check duplicate email
        if ($this->user && $this->user->email) {
            $duplicateEmailCount = User::where('id', '!=', $this->user_id)
                ->where('email', $this->user->email)
                ->count();
            if ($duplicateEmailCount > 0) {
                $flags[] = "Duplicate email address registered";
            }
        }

        return $flags;
    }

    public function hasService(string $service): bool
    {
        $services = $this->services ?: [];
        if (in_array($service, $services, true)) {
            return true;
        }

        // Backward compatibility mapping for older records
        if ($service === 'car' && in_array($this->service_type, ['rental_vehicle', 'car'])) return true;
        if ($service === 'package' && in_array($this->service_type, ['tour_package', 'package'])) return true;
        if ($service === 'guide' && in_array($this->service_type, ['tour_package', 'guide'])) return true;

        return false;
    }

    public function canCreatePackages(): bool
    {
        return $this->hasService('package') || $this->service_type === 'tour_package';
    }

    public function getCanCreatePackagesAttribute(): bool
    {
        return $this->canCreatePackages();
    }

    public function isGuideOnly(): bool
    {
        $services = $this->services ?: [];
        return in_array('guide', $services, true) && !in_array('package', $services, true) && !in_array('car', $services, true);
    }

    public function getIsGuideOnlyAttribute(): bool
    {
        return $this->isGuideOnly();
    }

    public function state()
    {
        return $this->belongsTo(State::class);
    }

    public function getPrimaryDistrictIds(): array
    {
        $hasVendorDistricts = $this->vendorDistricts()->exists();
        if ($hasVendorDistricts) {
            return array_map('intval', $this->vendorDistricts()
                ->where('level', 'primary')
                ->where('status', 'approved')
                ->pluck('district_id')
                ->toArray());
        }

        if ($this->district_id) {
            return [(int) $this->district_id];
        }

        return [];
    }

    public function getExtendedDistrictIds(): array
    {
        if ($this->extended_districts_revoked) {
            return [];
        }

        return array_map('intval', $this->vendorDistricts()
            ->where('level', 'extended')
            ->where('status', 'approved')
            ->pluck('district_id')
            ->toArray());
    }

    public function getApprovedDistrictIds(): array
    {
        $primary = $this->getPrimaryDistrictIds();
        $extended = $this->getExtendedDistrictIds();
        return array_values(array_unique(array_merge($primary, $extended)));
    }

    public function getApprovedDistrictNamesAttribute(): array
    {
        $districtIds = $this->getApprovedDistrictIds();
        if (empty($districtIds)) {
            return [];
        }

        return District::whereIn('id', $districtIds)->pluck('name')->toArray();
    }

    public function operatesInDistrict(int $districtId, ?string $service = null): bool
    {
        $primary = $this->getPrimaryDistrictIds();

        // Local guide service is strictly allowed ONLY in primary districts
        if ($service === 'guide' || $this->isGuideOnly()) {
            return in_array($districtId, $primary, true);
        }

        // Car & Package services can operate across both primary and extended districts
        $all = $this->getApprovedDistrictIds();
        return in_array($districtId, $all, true);
    }

    public function getDistrictTier(int $districtId): string
    {
        $primary = $this->getPrimaryDistrictIds();
        if (in_array($districtId, $primary, true)) {
            return 'primary';
        }
        return 'extended';
    }

    public function getDistrictRating(int $districtId): array
    {
        $reviews = $this->reviews()->where('district_id', $districtId)->get();
        if ($reviews->isEmpty()) {
            $overallAvg = (float) ($this->reviews()->avg('rating') ?? 4.8);
            return [
                'rating' => round($overallAvg, 1),
                'review_count' => $this->reviews()->count(),
                'is_district_specific' => false,
            ];
        }

        return [
            'rating' => round((float) $reviews->avg('rating'), 1),
            'review_count' => $reviews->count(),
            'is_district_specific' => true,
        ];
    }

    // Isolation Forest Machine Learning Risk Signals
    public function getBookingsOutsidePrimaryRateAttribute(): float
    {
        $total = $this->bookings()->where('bookings.status', 'completed')->count();
        if ($total === 0) return 0.0;

        $primaryIds = $this->getPrimaryDistrictIds();
        $outside = $this->bookings()
            ->join('listings', 'bookings.listing_id', '=', 'listings.id')
            ->where('bookings.status', 'completed')
            ->whereNotIn('listings.district_id', $primaryIds)
            ->count();

        return round($outside / $total, 3);
    }

    public function getRecentExtendedDistrictsCountAttribute(): int
    {
        return $this->vendorDistricts()
            ->where('level', 'extended')
            ->where('created_at', '>=', now()->subDays(30))
            ->count();
    }

    public function getCancellationRateOutsidePrimaryAttribute(): float
    {
        $primaryIds = $this->getPrimaryDistrictIds();
        $outsideTotal = $this->bookings()
            ->join('listings', 'bookings.listing_id', '=', 'listings.id')
            ->whereNotIn('listings.district_id', $primaryIds)
            ->count();

        if ($outsideTotal === 0) return 0.0;

        $outsideCancelled = $this->bookings()
            ->join('listings', 'bookings.listing_id', '=', 'listings.id')
            ->where('bookings.status', 'cancelled')
            ->whereNotIn('listings.district_id', $primaryIds)
            ->count();

        return round($outsideCancelled / $outsideTotal, 3);
    }

    public function canRequestDistrictChange(): bool
    {
        // 90-day cooldown enforcement
        $lastRequest = $this->districtChangeRequests()
            ->where('status', 'approved')
            ->latest('reviewed_at')
            ->first();

        if (!$lastRequest || !$lastRequest->reviewed_at) {
            return true;
        }

        return $lastRequest->reviewed_at->diffInDays(now()) >= 90;
    }

    public function getCanRequestDistrictChangeAttribute(): bool
    {
        return $this->canRequestDistrictChange();
    }

    public function getTrustTierAttribute(): array
    {
        $hasUnresolvedFlags = $this->fraudFlags()->where('resolved', false)->exists();
        if ($this->status === 'pending' || $hasUnresolvedFlags) {
            return [
                'tier' => 'under_review',
                'label' => 'Under Review',
                'badge' => 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                'description' => 'Profile is undergoing admin verification and safety screening.',
            ];
        }

        if ($this->kyc_status !== 'verified') {
            return [
                'tier' => 'new',
                'label' => 'New Partner',
                'badge' => 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                'description' => 'Newly onboarded local tourism partner with basic credentials.',
            ];
        }

        $bookingCount = $this->bookings()->where('bookings.status', 'completed')->count();
        $avgRating = (float) ($this->reviews()->avg('rating') ?? 0);

        if ($bookingCount >= 5 && $avgRating >= 4.5 && $this->trust_score >= 0.85) {
            return [
                'tier' => 'trusted',
                'label' => 'Trusted Partner ⭐',
                'badge' => 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/10',
                'description' => 'Top-tier verified partner with proven reliability and exceptional tourist feedback.',
            ];
        }

        return [
            'tier' => 'verified',
            'label' => 'Verified Partner ✓',
            'badge' => 'bg-teal-500/20 text-teal-300 border-teal-500/40',
            'description' => 'Verified local partner adhering to standard quality and safety guidelines.',
        ];
    }

    public function getDisplayTrustScoreAttribute(): int
    {
        return (int) round(($this->trust_score ?? 0.85) * 100);
    }

    public function getPublicLocationAttribute(): string
    {
        $names = $this->approved_district_names;
        if (!empty($names)) {
            return implode(' & ', $names) . ', Tamil Nadu';
        }
        return $this->district ? "{$this->district->name}, Tamil Nadu" : 'Tamil Nadu, India';
    }

    public function getAiTrustBreakdownAttribute(): array
    {
        $base = (float) ($this->trust_score ?? 0.85);
        $totalScore = (int) round($base * 100);
        return [
            'total' => $totalScore,
            'license_validity' => $this->tourism_license_path || $this->license_url ? 100 : 70,
            'aadhaar_verified' => $this->aadhaar_document_path || $this->aadhaar_masked ? 100 : 60,
            'review_sentiment' => min(100, (int) ($base * 100)),
            'cancellation_rate' => max(0, (int) ((1 - $base) * 20)),
            'fraud_risk_level' => $base > 0.8 ? 'Low' : ($base > 0.6 ? 'Moderate' : 'Elevated'),
        ];
    }

    public function vendorEvents()
    {
        return $this->hasMany(VendorEvent::class);
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }

    public function media()
    {
        return $this->hasMany(VendorMedia::class)->orderBy('sort_order');
    }

    public function tripMemories()
    {
        return $this->hasMany(TripMemory::class)->orderBy('trip_date', 'desc');
    }

    public function calculateProfileCompleteness(): array
    {
        $score = 0;
        $items = [];

        // 1. Business Info & Bio (25%)
        if (!empty($this->description) && strlen($this->description) >= 50) {
            $score += 25;
            $items[] = ['label' => 'Business profile & description added', 'completed' => true, 'points' => 25];
        } else {
            $items[] = ['label' => 'Add detailed business description (50+ chars)', 'completed' => false, 'points' => 25];
        }

        // 2. Profile / Logo Photos (20%)
        if (!empty($this->logo_url) || !empty($this->profile_photo_url)) {
            $score += 20;
            $items[] = ['label' => 'Logo or owner profile photo uploaded', 'completed' => true, 'points' => 20];
        } else {
            $items[] = ['label' => 'Upload business logo or profile photo', 'completed' => false, 'points' => 20];
        }

        // 3. Media Gallery (25%)
        $mediaCount = $this->media()->count();
        if ($mediaCount >= 4) {
            $score += 25;
            $items[] = ['label' => "Gallery photos added ({$mediaCount} photos)", 'completed' => true, 'points' => 25];
        } elseif ($mediaCount > 0) {
            $score += 15;
            $items[] = ['label' => "Add at least 4 gallery photos (currently {$mediaCount})", 'completed' => false, 'points' => 25];
        } else {
            $items[] = ['label' => 'Add at least 4 gallery photos to showcase services', 'completed' => false, 'points' => 25];
        }

        // 4. Offerings - Vehicles or Packages (30%)
        $packageCount = $this->listings()->where('is_active', true)->count();
        $vehicleCount = $this->vehicles()->where('is_active', true)->count();
        if ($packageCount > 0 || $vehicleCount > 0) {
            $score += 30;
            $items[] = ['label' => "Tour package or fleet vehicle published ({$packageCount} packages, {$vehicleCount} vehicles)", 'completed' => true, 'points' => 30];
        } else {
            $items[] = ['label' => 'Publish at least one tour package or fleet vehicle', 'completed' => false, 'points' => 30];
        }

        return [
            'percentage' => min(100, $score),
            'items' => $items,
            'is_ready_for_verification' => $score >= 70,
        ];
    }
}


