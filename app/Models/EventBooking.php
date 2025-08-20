<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventBooking extends Model
{
    protected $fillable = [
        'event_id',
        'slot_id',
        'users',
        'payment_id',
        'payment_status',
        'payment_method',
        'payment_details',
    ];

    protected $casts = [
        'users' => 'array',
        'payment_details' => 'array',
    ];
}
