<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TripMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_id',
        'sender_id',
        'sender_role',
        'message',
        'attachment_url',
        'custom_quote_payload',
        'is_read',
    ];

    protected $casts = [
        'custom_quote_payload' => 'array',
        'is_read' => 'boolean',
    ];

    public function chat()
    {
        return $this->belongsTo(TripChat::class, 'chat_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
