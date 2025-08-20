<?php

namespace App\Http\Controllers\Event;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;
use App\Models\EventSlot;
use App\Models\EventUser;
use App\Models\EventPayment;
use Razorpay\Api\Api;
use App\Models\PendingEventUser;

class EventPaymentController extends Controller
{
    public function createRazorpayOrder(Request $request, $eventId)
    {
        $validated = $request->validate([
            'slot_id' => 'required|integer',
            'amount' => 'required|numeric|min:1',
            'persons' => 'required|array',
        ]);
        // Save persons to pending_event_users
        foreach ($validated['persons'] as $person) {
            PendingEventUser::create([
                'event_id' => $eventId,
                'event_slot_id' => $validated['slot_id'],
                'first_name' => $person['first_name'],
                'last_name' => $person['last_name'],
                'email' => $person['email'],
                'phone' => $person['phone'],
                'status' => 'pending',
            ]);
        }
        $key_id = config('services.razorpay.key_id');
        $key_secret = config('services.razorpay.key_secret');
        $api = new Api($key_id, $key_secret);
        $order = $api->order->create([
            'amount' => intval($validated['amount'] * 100), // in paise
            'currency' => 'INR',
            'payment_capture' => 1,
            'notes' => [
                'event_id' => (string) $eventId,
                'slot_id' => (string) $validated['slot_id'],
            ],
        ]);
        return response()->json([
            'id' => $order['id'],
            'amount' => $order['amount'],
            'razorpayKey' => $key_id,
        ]);
    }

    public function verifyRazorpayPayment(Request $request, $eventId)
    {
        $validated = $request->validate([
            'slot_id' => 'required|integer',
            'payment_id' => 'required|string',
            'order_id' => 'required|string',
            'signature' => 'required|string',
            'persons' => 'required|array',
            'amount' => 'required|numeric|min:1',
        ]);
        $key_secret = config('services.razorpay.key_secret');
        $generated_signature = hash_hmac('sha256', $validated['order_id'] . '|' . $validated['payment_id'], $key_secret);
        if ($generated_signature !== $validated['signature']) {
            return response()->json(['success' => false, 'message' => 'Signature mismatch'], 400);
        }
        // Mark slot as booked, store users and payment
        DB::beginTransaction();
        try {
            $slot = EventSlot::findOrFail($validated['slot_id']);
            $slot->status = 'booked';
            $slot->save();
            // Subtract slots from event's available_slots
            $event = DB::table('events')->where('id', $eventId)->first();
            if ($event) {
                $newSlots = max(0, $event->available_slots - $slot->slots);
                DB::table('events')->where('id', $eventId)->update(['available_slots' => $newSlots]);
            }
            // Store each person
            foreach ($validated['persons'] as $person) {
                EventUser::create([
                    'event_id' => $eventId,
                    'event_slot_id' => $slot->id,
                    'first_name' => $person['first_name'],
                    'last_name' => $person['last_name'],
                    'email' => $person['email'],
                    'phone' => $person['phone'],
                ]);
            }
            // Store payment
            EventPayment::create([
                'event_id' => $eventId,
                'event_slot_id' => $slot->id,
                'amount' => $validated['amount'],
                'payment_id' => $validated['payment_id'],
                'status' => 'paid',
                'method' => 'razorpay',
                'details' => json_encode($validated),
            ]);
            DB::commit();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Razorpay payment store failed: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to store payment'], 500);
        }
    }

    public function razorpayWebhook(Request $request)
    {
        $webhookSecret = config('services.razorpay.webhook_secret');
        $payload = $request->getContent();
        $signature = $request->header('X-Razorpay-Signature');
        Log::info('Razorpay Webhook Received', [
            'payload' => $payload,
            'headers' => $request->headers->all(),
            'signature' => $signature,
        ]);
        if (!$signature || !$webhookSecret) {
            Log::error('Razorpay Webhook: Missing signature or secret', [
                'signature' => $signature,
                'webhookSecret' => $webhookSecret,
            ]);
            return response()->json(['error' => 'Missing signature or secret'], 400);
        }
        $expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);
        if (!hash_equals($expectedSignature, $signature)) {
            Log::error('Razorpay Webhook: Invalid signature', [
                'expected' => $expectedSignature,
                'received' => $signature,
                'payload' => $payload,
            ]);
            return response()->json(['error' => 'Invalid signature'], 400);
        }
        $data = $request->all();
        Log::info('Razorpay Webhook: Signature verified', [
            'data' => $data,
        ]);
        if (($data['event'] ?? null) === 'payment.captured') {
            $paymentEntity = $data['payload']['payment']['entity'] ?? [];
            $orderId = $paymentEntity['order_id'] ?? null;
            $paymentId = $paymentEntity['id'] ?? null;
            $amount = $paymentEntity['amount'] / 100;
            $notes = $paymentEntity['notes'] ?? [];
            $eventId = $notes['event_id'] ?? null;
            $slotId = $notes['slot_id'] ?? null;
            Log::info('Razorpay Webhook: payment.captured event', [
                'orderId' => $orderId,
                'paymentId' => $paymentId,
                'amount' => $amount,
                'eventId' => $eventId,
                'slotId' => $slotId,
            ]);
            if ($eventId && $slotId && $paymentId && $orderId) {
                DB::beginTransaction();
                try {
                    $slot = EventSlot::find($slotId);
                    if ($slot && $slot->status !== 'booked') {
                        $slot->status = 'booked';
                        $slot->save();
                        $event = DB::table('events')->where('id', $eventId)->first();
                        if ($event) {
                            $newSlots = max(0, $event->available_slots - $slot->slots);
                            DB::table('events')->where('id', $eventId)->update(['available_slots' => $newSlots]);
                        }
                        // Move persons from pending_event_users to event_users
                        $pendingPersons = PendingEventUser::where('event_id', $eventId)
                            ->where('event_slot_id', $slotId)
                            ->where('status', 'pending')
                            ->get();
                        Log::info('Razorpay Webhook: Pending persons found', [
                            'count' => $pendingPersons->count(),
                        ]);
                        $usersArray = [];
                        foreach ($pendingPersons as $person) {
                            EventUser::create([
                                'event_id' => $eventId,
                                'event_slot_id' => $slot->id,
                                'first_name' => $person->first_name,
                                'last_name' => $person->last_name,
                                'email' => $person->email,
                                'phone' => $person->phone,
                            ]);
                            $usersArray[] = [
                                'first_name' => $person->first_name,
                                'last_name' => $person->last_name,
                                'email' => $person->email,
                                'phone' => $person->phone,
                            ];
                            $person->status = 'confirmed';
                            $person->payment_id = $paymentId;
                            $person->save();
                        }
                        // Create EventBooking record
                        $booking = \App\Models\EventBooking::create([
                            'event_id' => $eventId,
                            'slot_id' => $slot->id,
                            'users' => $usersArray,
                            'payment_id' => $paymentId,
                            'payment_status' => 'paid',
                            'payment_method' => 'razorpay',
                            'payment_details' => $paymentEntity,
                        ]);
                        // Notify all admin and superadmin users
                        $admins = \App\Models\User::whereHas('role', function($q) {
                            $q->whereIn('name', ['admin', 'superadmin']);
                        })->get();

                        Log::info('EventBooking: Found admins to notify', [
                            'admin_count' => $admins->count(),
                            'admin_emails' => $admins->pluck('email')->toArray(),
                            'booking_id' => $booking->id,
                            'event_id' => $eventId
                        ]);

                        foreach ($admins as $admin) {
                            Log::info('EventBooking: Sending notification to admin', [
                                'admin_id' => $admin->id,
                                'admin_email' => $admin->email,
                                'admin_role' => $admin->role->name ?? 'unknown'
                            ]);
                            $admin->notify(new \App\Notifications\EventBookedNotification($booking));
                        }
                        // Broadcast a live event to all admins/superadmins
                        event(new \App\Events\EventBookingCreated($booking));
                        EventPayment::updateOrCreate([
                            'event_id' => $eventId,
                            'event_slot_id' => $slot->id,
                            'payment_id' => $paymentId,
                        ], [
                            'amount' => $amount,
                            'status' => 'paid',
                            'method' => 'razorpay',
                            'details' => json_encode($paymentEntity),
                        ]);
                    } else {
                        Log::warning('Razorpay Webhook: Slot not found or already booked', [
                            'slotId' => $slotId,
                            'slot' => $slot,
                        ]);
                    }
                    DB::commit();
                    return response()->json(['success' => true]);
                } catch (\Exception $e) {
                    DB::rollBack();
                    Log::error('Razorpay webhook failed: ' . $e->getMessage(), [
                        'exception' => $e,
                    ]);
                    return response()->json(['success' => false, 'message' => 'Webhook failed'], 500);
                }
            } else {
                Log::error('Razorpay Webhook: Missing required fields', [
                    'eventId' => $eventId,
                    'slotId' => $slotId,
                    'paymentId' => $paymentId,
                    'orderId' => $orderId,
                ]);
            }
        } else {
            Log::info('Razorpay Webhook: Event not payment.captured', [
                'event' => $data['event'] ?? null,
            ]);
        }
        return response()->json(['success' => true]); // Always return 200 to Razorpay
    }

    public function adminIndex()
    {
        $payments = EventPayment::with(['slot', 'slot.event', 'slot.users'])
            ->orderBy('created_at', 'desc')
            ->get();
        return inertia('admin/event-payments', [
            'payments' => $payments,
        ]);
    }

    public function refund(Request $request, $paymentId)
    {
        $payment = EventPayment::findOrFail($paymentId);
        if ($payment->status === 'refunded') {
            return back()->withErrors(['message' => 'Already refunded']);
        }
        $key_id = config('services.razorpay.key_id');
        $key_secret = config('services.razorpay.key_secret');
        $api = new \Razorpay\Api\Api($key_id, $key_secret);
        try {
            $razorpayPayment = $api->payment->fetch($payment->payment_id);
            $refund = $razorpayPayment->refund(['amount' => intval($payment->amount * 100)]);
            $payment->status = 'refunded';
            $payment->refunded_at = now();
            $payment->details = json_encode(['refund' => $refund] + json_decode($payment->details, true));
            $payment->save();
            // Optionally, increase available_slots back
            $event = DB::table('events')->where('id', $payment->event_id)->first();
            if ($event) {
                DB::table('events')->where('id', $payment->event_id)->update([
                    'available_slots' => $event->available_slots + ($payment->slot->slots ?? 1)
                ]);
            }
            return back()->with('success', 'Refund successful');
        } catch (\Exception $e) {
            Log::error('Refund failed: ' . $e->getMessage());
            return back()->withErrors(['message' => 'Refund failed: ' . $e->getMessage()]);
        }
    }
}
