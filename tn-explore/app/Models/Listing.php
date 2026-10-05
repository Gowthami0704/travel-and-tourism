<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Listing extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'district_id',
        'title',
        'category',
        'start_district_id',
        'start_city',
        'start_state',
        'destinations',
        'duration_days',
        'duration_nights',
        'group_size',
        'price',
        'price_per_person',
        'child_with_bed_price',
        'child_without_bed_price',
        'accommodation',
        'transport',
        'day_wise_itinerary',
        'inclusions',
        'exclusions',
        'need_to_know',
        'payment_terms',
        'cancellation_slabs',
        'difficulty',
        'weather_season_note',
        'is_adventure',
        'is_group_departure',
        'description',
        'type',
        'scope',
        'destination_states',
        'permit_document_path',
        'approval_status',
        'rejection_reason',
        'cancellation_policy',
        'emergency_contact',
        'days',
        'itinerary',
        'image_url',
        'images',
        'details',
        'status',
        'is_active',
    ];

    protected $casts = [
        'details' => 'array',
        'images' => 'array',
        'itinerary' => 'array',
        'destinations' => 'array',
        'day_wise_itinerary' => 'array',
        'inclusions' => 'array',
        'exclusions' => 'array',
        'need_to_know' => 'array',
        'payment_terms' => 'array',
        'cancellation_slabs' => 'array',
        'destination_states' => 'array',
        'is_active' => 'boolean',
        'is_adventure' => 'boolean',
        'is_group_departure' => 'boolean',
        'price' => 'decimal:2',
        'price_per_person' => 'decimal:2',
        'child_with_bed_price' => 'decimal:2',
        'child_without_bed_price' => 'decimal:2',
        'duration_days' => 'integer',
        'duration_nights' => 'integer',
        'days' => 'integer',
        'group_size' => 'integer',
    ];

    public function packageDepartures()
    {
        return $this->hasMany(PackageDeparture::class);
    }

    public function startDistrict()
    {
        return $this->belongsTo(District::class, 'start_district_id');
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function isOutsideTn(): bool
    {
        return $this->scope === 'outside_tn';
    }

    public function isApproved(): bool
    {
        if ($this->scope === 'outside_tn') {
            return $this->approval_status === 'approved';
        }
        return true;
    }

    public function scopePublished($query)
    {
        return $query->where('is_active', true)
                     ->where('status', '!=', 'draft')
                     ->where(function ($q) {
                         $q->where('scope', 'inside_tn')
                           ->orWhere(function ($sub) {
                               $sub->where('scope', 'outside_tn')
                                   ->where('approval_status', 'approved');
                           });
                     });
    }
}
