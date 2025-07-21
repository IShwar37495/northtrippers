<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('name');                    // Event name
            $table->string('state');                   // State the event belongs to
            $table->integer('days');                   // Fixed number of days
            $table->date('event_date');                // Event date
            $table->time('event_time');                // Event pickup time
            $table->json('itinerary')->nullable();     // Day-wise itinerary
            $table->boolean('meal_included')->default(false);  // Whether meal is included
            $table->string('meal_times')->nullable();  // One time, two times, three times
            $table->decimal('meal_price', 10, 2)->nullable(); // Meal price per person per day
            $table->boolean('hotel_included')->default(false); // Whether hotel is included
            $table->decimal('hotel_price', 10, 2)->nullable(); // Hotel price per person per day
            $table->integer('min_age')->default(0);    // Minimum age required
            $table->integer('max_age')->nullable();    // Maximum age allowed
            $table->json('photos')->nullable();        // Event photos
            $table->integer('available_slots');        // Number of available slots
            $table->integer('vehicle_id');             // Selected vehicle ID
            $table->json('activities')->nullable();    // List of activities
            $table->string('boarding_point');          // Boarding point
            $table->integer('pickup_location_id');     // Selected pickup location ID
            $table->decimal('base_price', 10, 2);      // Base price per person
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
