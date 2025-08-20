<?php

use App\Http\Controllers\Vehicle\VehicleController;
use App\Http\Controllers\PickupLocation\PickupLocationController;
use App\Http\Controllers\Package\PackageController;
use App\Http\Controllers\Event\EventController;
use App\Http\Controllers\Inquiry\InquiryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// package routes

// Admin package management routes (protected by auth)
Route::middleware(['auth'])->group(function () {
    Route::get('/packages/create', [PackageController::class, 'create'])->name('packages.create');
    Route::post('/packages', [PackageController::class, 'store'])->name('packages.store');
    Route::get('/packages', [PackageController::class, 'index'])->name('packages.index');
    Route::get('/packages/{package}/edit', [PackageController::class, 'edit'])->name('packages.edit');
    Route::put('/packages/{package}', [PackageController::class, 'update'])->name('packages.update');
    Route::delete('/packages/{package}', [PackageController::class, 'destroy'])->name('packages.destroy');
});

// Admin event management routes (protected by auth)
Route::middleware(['auth'])->group(function () {
    Route::get('/events/create', [EventController::class, 'create'])->name('events.create');
    Route::post('/events', [EventController::class, 'store'])->name('events.store');
    Route::get('/events', [EventController::class, 'index'])->name('events.index');
    Route::get('/events/{event}/edit', [EventController::class, 'edit'])->name('events.edit');
    Route::put('/events/{event}', [EventController::class, 'update'])->name('events.update');
    Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');
});

// Public package routes (for users)
Route::get('/packages/browse', function () {
    return Inertia::render('packages/browse');
})->name('packages.browse');
Route::get('/packages/list', [PackageController::class, 'list'])->name('packages.list');
Route::get('/packages/paginate', [PackageController::class, 'paginate'])->name('packages.paginate');
Route::get('/packages/search', [PackageController::class, 'search'])->name('packages.search');
Route::get('/packages/{package}', [PackageController::class, 'show'])->name('packages.show');

// Public event routes (for users)
Route::get('/events/browse', function () {
    return Inertia::render('events/browse');
})->name('events.browse');
Route::get('/events/list', [EventController::class, 'list'])->name('events.list');
Route::get('/events/paginate', [EventController::class, 'paginate'])->name('events.paginate');
Route::get('/events/search', [EventController::class, 'search'])->name('events.search');
Route::get('/events/{event}', [EventController::class, 'show'])->name('events.show');
Route::get('/events/{event}/book', [EventController::class, 'bookPage'])->name('events.bookPage');
Route::post('/events/{event}/book', [EventController::class, 'book'])->name('events.book');
Route::get('/events/booking-success', function () {
    return Inertia::render('events/booking-success');
})->name('events.bookingSuccess');
Route::get('/events/{event}/pay/{slot}', [App\Http\Controllers\Event\EventController::class, 'payPage'])->name('events.pay');

// Payment route
Route::get('/payment', function () {
    return Inertia::render('payment');
})->name('payment');

// vehicles route

// Add vehicle management routes
Route::middleware(['auth'])->group(function () {
    Route::post('/vehicles', [VehicleController::class, 'store'])->name('vehicle.store');
    Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicle.index');
    Route::get('/vehicles/api', [VehicleController::class, 'apiIndex'])->name('vehicle.api.index');
    Route::get('/vehicles/paginate', [VehicleController::class, 'paginate'])->name('vehicle.paginate');
    Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy'])->name('vehicle.destroy');
});

// pickup locations route

// Add pickup location management routes
Route::post('/pickup-locations', [PickupLocationController::class, 'store'])->name('pickup-location.store');
Route::get('/pickup-locations', [PickupLocationController::class, 'index'])->name('pickup-location.index');
Route::get('/pickup-locations/api', [PickupLocationController::class, 'apiIndex'])->name('pickup-location.api.index');
Route::get('/pickup-locations/paginate', [PickupLocationController::class, 'paginate'])->name('pickup-location.paginate');
Route::get('/pickup-locations/search', [PickupLocationController::class, 'search'])->name('pickup-location.search');
Route::delete('/pickup-locations/{id}', [PickupLocationController::class, 'destroy'])->name('pickup-location.destroy');

// Admin event payments management
Route::middleware(['auth'])->group(function () {
    Route::get('/admin/event-payments', [\App\Http\Controllers\Event\EventPaymentController::class, 'adminIndex'])->name('admin.eventPayments');
    Route::post('/admin/event-payments/{payment}/refund', [\App\Http\Controllers\Event\EventPaymentController::class, 'refund'])->name('admin.eventPayments.refund');
});

// Admin event bookings page (protected by auth)
Route::middleware(['auth'])->group(function () {
    Route::get('/admin-event-bookings', function () {
        return Inertia::render('admin-event-bookings');
    })->name('admin.eventBookings');

    // Test route for debugging notifications
    Route::get('/test-notification', function () {
        $user = auth()->user();
        if ($user && ($user->hasRole('admin') || $user->hasRole('superadmin'))) {
            // Create a test booking
            $testBooking = \App\Models\EventBooking::create([
                'event_id' => 1,
                'slot_id' => 1,
                'users' => [['first_name' => 'Test', 'last_name' => 'User', 'email' => 'test@example.com', 'phone' => '1234567890']],
                'payment_id' => 'test_payment_' . time(),
                'payment_status' => 'paid',
                'payment_method' => 'test',
                'payment_details' => ['test' => true],
            ]);

            // Send notification to current user
            $user->notify(new \App\Notifications\EventBookedNotification($testBooking));

            return response()->json(['success' => true, 'message' => 'Test notification sent']);
        }
        return response()->json(['success' => false, 'message' => 'Not authorized'], 403);
    })->name('test.notification');

    // Test route for WhatsApp notifications
    Route::get('/test-whatsapp', function () {
        $user = auth()->user();
        if ($user && ($user->hasRole('admin') || $user->hasRole('superadmin'))) {
            // Create a test booking
            $testBooking = \App\Models\EventBooking::create([
                'event_id' => 1,
                'slot_id' => 1,
                'users' => [['first_name' => 'Test', 'last_name' => 'User', 'email' => 'test@example.com', 'phone' => '1234567890']],
                'payment_id' => 'test_payment_' . time(),
                'payment_status' => 'paid',
                'payment_method' => 'test',
                'payment_details' => ['test' => true],
            ]);

            // Send WhatsApp notification to the configured number
            $user->notify(new \App\Notifications\EventBookedNotification($testBooking));

            return response()->json(['success' => true, 'message' => 'WhatsApp test notification sent to +8628037495']);
        }
        return response()->json(['success' => false, 'message' => 'Not authorized'], 403);
    })->name('test.whatsapp');
});

// inquiry routes
Route::post('/inquiries', [InquiryController::class, 'store'])->name('inquiries.store');
Route::middleware(['auth'])->group(function () {
    Route::get('/inquiries', [InquiryController::class, 'index'])->name('inquiries.index');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
