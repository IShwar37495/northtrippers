<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Event;

class EventUser extends Model
{
    protected $fillable = [
        'event_id',
        'event_slot_id',
        'first_name',
        'last_name',
        'email',
        'phone',
    ];
    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id');
    }
    public function slot()
    {
        return $this->belongsTo(\App\Models\EventSlot::class, 'event_slot_id');
    }
}
