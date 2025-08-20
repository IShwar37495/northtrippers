<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'name',
        'state',
        'days',
        'event_date',
        'event_time',
        'itinerary',
        'meal_included',
        'meal_times',
        'meal_price',
        'hotel_included',
        'hotel_price',
        'min_age',
        'max_age',
        'photos',
        'available_slots',
        'vehicle_id',
        'activities',
        'boarding_point',
        'pickup_location_id',
        'base_price',
    ];

    // Relationships
    public function slots()
    {
        return $this->hasMany(EventSlot::class);
    }
    public function payments()
    {
        return $this->hasMany(EventPayment::class);
    }
    public function users()
    {
        return $this->hasMany(EventUser::class);
    }
}
