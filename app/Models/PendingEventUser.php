<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PendingEventUser extends Model
{
    protected $fillable = [
        'event_id',
        'event_slot_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'status',
        'payment_id',
    ];
}
