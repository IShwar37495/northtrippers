<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventPayment extends Model
{
    protected $fillable = [
        'event_id',
        'event_slot_id',
        'amount',
        'payment_id',
        'status',
        'method',
        'details',
    ];
    public function slot()
    {
        return $this->belongsTo(\App\Models\EventSlot::class, 'event_slot_id');
    }
    public function event()
    {
        return $this->belongsTo(\App\Models\Event::class, 'event_id');
    }
}
