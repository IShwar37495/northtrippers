<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Event\EventPaymentController;
use App\Models\EventBooking;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');





Route::post('/events/{event}/razorpay-order', [EventPaymentController::class, 'createRazorpayOrder']);
Route::post('/events/{event}/razorpay-verify', [EventPaymentController::class, 'verifyRazorpayPayment']);
Route::get('/events/{event}/razorpay-verify', function () {
    return response()->json(['error' => 'GET not allowed. Use POST.'], 405);
});
Route::post('/razorpay/webhook', [EventPaymentController::class, 'razorpayWebhook']);

Route::get('/admin/event-bookings', function () {
    return response()->json([
        'bookings' => EventBooking::orderBy('created_at', 'desc')->get(),
    ]);
});

