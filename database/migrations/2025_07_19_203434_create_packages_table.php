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
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');                    // Package name
            $table->text('description')->nullable();   // Package description
            $table->string('state');                   // State the package belongs to
            $table->json('tags')->nullable();          // Searchable tags for locations
            $table->integer('min_days');               // Minimum days required
            $table->integer('max_days');               // Maximum days allowed
            $table->integer('min_persons');            // Minimum persons required
            $table->integer('max_persons');            // Maximum persons allowed
            $table->integer('min_age')->default(0);    // Minimum age required
            $table->integer('max_age')->nullable();    // Maximum age allowed
            $table->decimal('base_price', 10, 2);      // Base price per person (without meal/hotel)
            $table->decimal('meal_price', 10, 2)->nullable(); // Additional meal price
            $table->decimal('hotel_price', 10, 2)->nullable(); // Additional hotel price
            $table->boolean('hotel_included')->default(false); // Whether hotel is included
            $table->boolean('meal_included')->default(false);  // Whether meal is included
            $table->string('meal_times')->nullable();  // One time, two times, etc.
            $table->text('hotel_links')->nullable();   // Hotel booking links
            $table->text('travel_points');             // Travel points covered
            $table->string('boarding_location');       // Boarding location
            $table->json('photos')->nullable();        // Package photos URLs
            $table->boolean('is_active')->default(true); // Whether package is active
            $table->timestamps();
        });

        // Create pivot table for packages and vehicles (many-to-many)
        Schema::create('package_vehicle', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained()->onDelete('cascade');
            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Create pivot table for packages and pickup locations (many-to-many)
        Schema::create('package_pickup_location', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained()->onDelete('cascade');
            $table->foreignId('pickup_location_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('package_pickup_location');
        Schema::dropIfExists('package_vehicle');
        Schema::dropIfExists('packages');
    }
};
