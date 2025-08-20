<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Event;

class EventSlot extends Model
{
    protected $fillable = [
        'event_id',
        'status',
        'total_amount',
        'slots',
        'persons',
        'payment_info',
    ];

    protected $casts = [
        'persons' => 'array',
        'payment_info' => 'array',
    ];

    public function users()
    {
        return $this->hasMany(\App\Models\EventUser::class, 'event_slot_id');
    }
    public function event()
    {
        return $this->belongsTo(\App\Models\Event::class, 'event_id');
    }
}
