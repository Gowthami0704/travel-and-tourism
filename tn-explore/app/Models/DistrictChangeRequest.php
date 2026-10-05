<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DistrictChangeRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'old_district_id',
        'new_district_id',
        'reason',
        'status',
        'admin_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function oldDistrict()
    {
        return $this->belongsTo(District::class, 'old_district_id');
    }

    public function newDistrict()
    {
        return $this->belongsTo(District::class, 'new_district_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
