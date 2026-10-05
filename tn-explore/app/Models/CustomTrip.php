<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomTrip extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'destination_region',
        'scope',
        'start_place',
        'end_place',
        'route_type',
        'destinations',
        'trip_type',
        'date_mode',
        'start_date',
        'end_date',
        'flexible_month',
        'duration_days',
        'adults_count',
        'children_count',
        'budget_min',
        'budget_max',
        'budget_total',
        'budget_basis',
        'budget_split',
        'currency',
        'accommodation_pref',
        'stay_level',
        'transport_pref',
        'transport',
        'food_pref',
        'meals',
        'guide',
        'required_services',
        'travelers',
        'preferences',
        'notes',
        'plan_options',
        'selected_plan',
        'status',
        'admin_notes',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'destinations' => 'array',
        'required_services' => 'array',
        'budget_split' => 'array',
        'travelers' => 'array',
        'preferences' => 'array',
        'plan_options' => 'array',
        'guide' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'verified_at' => 'datetime',
        'budget_min' => 'decimal:2',
        'budget_max' => 'decimal:2',
        'budget_total' => 'decimal:2',
    ];

    public function legs()
    {
        return $this->hasMany(CustomTripLeg::class)->orderBy('leg_order');
    }

    protected $appends = [
        'route_display',
        'travelers_display',
        'budget_display',
        'interests_display',
    ];

    public function getRouteDisplayAttribute(): string
    {
        if (is_array($this->destinations) && count($this->destinations) > 0) {
            return implode(' ➔ ', $this->destinations);
        }
        return 'Tamil Nadu Heritage Circuit';
    }

    public function getTravelersDisplayAttribute(): string
    {
        $adults = $this->adults_count ?: 2;
        $kids = $this->children_count ?: 0;
        return $kids > 0 ? "{$adults} Adults, {$kids} Kids" : "{$adults} Travelers";
    }

    public function getBudgetDisplayAttribute(): string
    {
        if ($this->budget_min && $this->budget_max) {
            return '₹' . number_format($this->budget_min) . ' - ₹' . number_format($this->budget_max);
        } elseif ($this->budget_max) {
            return 'Up to ₹' . number_format($this->budget_max);
        } elseif ($this->budget_min) {
            return 'From ₹' . number_format($this->budget_min);
        }
        return '₹15,000 - ₹35,000 (Estimated)';
    }

    public function getInterestsDisplayAttribute(): array
    {
        $interests = [];
        if (!empty($this->trip_type)) {
            $interests[] = ucfirst(str_replace('_', ' ', $this->trip_type));
        }
        if (!empty($this->accommodation_pref)) {
            $interests[] = ucfirst(str_replace('_', ' ', $this->accommodation_pref)) . ' Stay';
        }
        if (!empty($this->transport_pref)) {
            $interests[] = ucfirst(str_replace('_', ' ', $this->transport_pref));
        }
        if (is_array($this->required_services)) {
            foreach ($this->required_services as $srv) {
                $interests[] = ucfirst(str_replace('_', ' ', $srv));
            }
        }
        return array_unique($interests);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function proposals()
    {
        return $this->hasMany(TripProposal::class);
    }

    public function chats()
    {
        return $this->hasMany(TripChat::class);
    }
}
