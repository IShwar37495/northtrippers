<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Notification;
use App\Notifications\Channels\WhatsAppChannel;

class WhatsAppServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }

    public function boot()
    {
        Notification::extend('whatsapp', function ($app) {
            return new WhatsAppChannel();
        });
    }
}
