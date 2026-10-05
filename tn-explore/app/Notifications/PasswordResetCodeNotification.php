<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetCodeNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $code,
        public int $expiresMinutes = 10,
        public string $portal = 'tourist'
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $portalLabel = match ($this->portal) {
            'admin' => 'State Administration Portal',
            'vendor' => 'Partner Hub Portal',
            default => 'Tourist Portal',
        };

        return (new MailMessage)
            ->subject("Your 6-Digit Password Reset Verification Code - TN Explore ({$portalLabel})")
            ->greeting("Hello {$notifiable->name},")
            ->line("You recently requested to reset your password for your **TN Explore ({$portalLabel})** account.")
            ->line("Your 6-digit verification code is:")
            ->line("**{$this->code}**")
            ->line("This verification code will expire in **{$this->expiresMinutes} minutes** and can only be used once.")
            ->line("If you did not request a password reset, please ignore this email or contact support immediately. Your password remains unchanged.")
            ->salutation("Best regards,\nTN Explore Security Team");
    }
}
