<?php

namespace App\Notifications\Channels;

use Illuminate\Notifications\Notification;
use Twilio\Rest\Client;
use Illuminate\Support\Facades\Log;

class WhatsAppChannel
{
    protected $client;
    protected $from;

    public function __construct()
    {
        $accountSid = config('services.twilio.account_sid');
        $authToken = config('services.twilio.auth_token');
        $this->from = config('services.twilio.whatsapp_from');

        if ($accountSid && $authToken) {
            $this->client = new Client($accountSid, $authToken);
        }
    }

    public function send($notifiable, Notification $notification)
    {
        if (!$this->client) {
            Log::error('WhatsApp Channel: Twilio client not initialized - missing credentials');
            return;
        }

        if (method_exists($notification, 'toWhatsApp')) {
            $message = $notification->toWhatsApp($notifiable);
        } else {
            Log::error('WhatsApp Channel: toWhatsApp method not found in notification');
            return;
        }

        try {
            $this->client->messages->create(
                $message['to'],
                [
                    'from' => $this->from,
                    'body' => $message['body']
                ]
            );

            Log::info('WhatsApp message sent successfully', [
                'to' => $message['to'],
                'from' => $this->from
            ]);
        } catch (\Exception $e) {
            Log::error('WhatsApp message failed to send', [
                'error' => $e->getMessage(),
                'to' => $message['to'] ?? 'unknown'
            ]);
        }
    }
}
