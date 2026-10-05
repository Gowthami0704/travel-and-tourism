<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordChangedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $ipAddress,
        public string $timestamp
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Security Alert: Your Password Was Changed - TN Explore")
            ->greeting("Hello {$notifiable->name},")
            ->line("This is an official security confirmation that the password for your TN Explore account (**{$notifiable->email}**) was successfully changed.")
            ->line("**Time:** {$this->timestamp}")
            ->line("**IP Address:** {$this->ipAddress}")
            ->line("For your protection, all other active sessions and remembered devices have been logged out.")
            ->line("If you did not make this change, please recover your account immediately or contact security support.")
            ->salutation("Best regards,\nTN Explore Security Team");
    }
}
