<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'tourist_id',
        'vendor_id',
        'district_id',
        'target_type',
        'target_id',
        'rating',
        'title',
        'comment',
        'photos',
        'tags',
        'visit_date',
        'sentiment',
        'spam_score',
        'abuse_score',
        'status',
        'helpful_count',
        'not_helpful_count',
        'vendor_reply',
    ];

    protected $casts = [
        'rating' => 'integer',
        'photos' => 'array',
        'tags' => 'array',
        'vendor_reply' => 'array',
        'visit_date' => 'date',
        'spam_score' => 'integer',
        'abuse_score' => 'integer',
        'helpful_count' => 'integer',
        'not_helpful_count' => 'integer',
    ];

    public function tourist()
    {
        return $this->belongsTo(User::class, 'tourist_id');
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function place()
    {
        return $this->belongsTo(Place::class, 'target_id');
    }

    public function votes()
    {
        return $this->hasMany(ReviewVote::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }
}
