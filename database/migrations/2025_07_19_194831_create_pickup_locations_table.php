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
        Schema::create('pickup_locations', function (Blueprint $table) {
            $table->id();
            $table->string('name');              // location name
            $table->text('address');             // full address
            $table->string('city');              // city
            $table->string('state');             // state/province
            $table->string('zip_code');          // postal code
            $table->string('phone')->nullable(); // phone number
            $table->string('email')->nullable(); // email address
            $table->string('image_url')->nullable(); // location image
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pickup_locations');
    }
};
