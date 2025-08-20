<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use App\Models\EventBooking;
use App\Models\Event;
use Illuminate\Support\Facades\Log;
use App\Notifications\Channels\WhatsAppChannel;

class EventBookedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $booking;

    public function __construct(EventBooking $booking)
    {
        $this->booking = $booking;
    }

    public function via($notifiable)
    {
        return ['mail', 'broadcast', WhatsAppChannel::class];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('New Event Booking')
            ->line('A new event has been booked!')
            ->line('Event ID: ' . $this->booking->event_id)
            ->line('Slot ID: ' . $this->booking->slot_id)
            ->line('Payment ID: ' . $this->booking->payment_id)
            ->line('Payment Status: ' . $this->booking->payment_status)
            ->line('Payment Method: ' . $this->booking->payment_method)
            ->line('User(s):')
            ->line(collect($this->booking->users)->map(function($u) {
                return $u['first_name'] . ' ' . $u['last_name'] . ' (' . $u['email'] . ', ' . $u['phone'] . ')';
            })->implode(', '))
            ->line('View in admin dashboard for more details.');
    }

    public function toBroadcast($notifiable)
    {
        Log::info('EventBookedNotification: Broadcasting notification', [
            'notifiable_id' => $notifiable->id,
            'notifiable_email' => $notifiable->email,
            'booking_id' => $this->booking->id,
            'event_id' => $this->booking->event_id
        ]);

        return new BroadcastMessage([
            'booking' => $this->booking->toArray(),
        ]);
    }

    public function toWhatsApp($notifiable)
    {
        // Get event details
        $event = Event::find($this->booking->event_id);
        $eventName = $event ? $event->name : 'Unknown Event';
        $eventDate = $event ? $event->event_date : 'TBD';

        // Format users list
        $usersList = collect($this->booking->users)->map(function($user) {
            return "• {$user['first_name']} {$user['last_name']} ({$user['phone']})";
        })->implode("\n");

        // Calculate total amount
        $totalAmount = 0;
        if ($event) {
            $totalAmount = count($this->booking->users) * $event->base_price;
        }

        $message = "🚀 *New Event Booking!*\n\n";
        $message .= "📅 *Event:* {$eventName}\n";
        $message .= "📆 *Date:* {$eventDate}\n";
        $message .= "💰 *Payment:* ₹" . number_format($totalAmount, 2) . " ({$this->booking->payment_status})\n";
        $message .= "💳 *Method:* {$this->booking->payment_method}\n\n";
        $message .= "👥 *Booked Users:*\n{$usersList}\n\n";
        $message .= "🆔 *Booking ID:* {$this->booking->id}\n";
        $message .= "🆔 *Payment ID:* {$this->booking->payment_id}\n\n";
        $message .= "Check admin dashboard for full details! 📊";

        return [
            'to' => 'whatsapp:+8628037495',
            'body' => $message
        ];
    }

    public function toArray($notifiable)
    {
        return [
            'booking' => $this->booking->toArray(),
        ];
    }
}
