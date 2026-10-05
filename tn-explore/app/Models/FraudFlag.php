<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FraudFlag extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'reason',
        'severity',
        'resolved',
        'top_reasons',
        'peer_comparison',
        'hard_rule_hits',
        'isolation_forest_score',
        'model_version',
        'features_snapshot',
        'admin_action',
        'dismissed_reason',
        'action_note',
        'action_deadline',
        'actioned_at',
        'actioned_by',
        'vendor_reply',
        'vendor_replied_at',
    ];

    protected $casts = [
        'resolved' => 'boolean',
        'top_reasons' => 'array',
        'peer_comparison' => 'array',
        'hard_rule_hits' => 'array',
        'features_snapshot' => 'array',
        'isolation_forest_score' => 'float',
        'action_deadline' => 'datetime',
        'actioned_at' => 'datetime',
        'vendor_replied_at' => 'datetime',
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }
}
