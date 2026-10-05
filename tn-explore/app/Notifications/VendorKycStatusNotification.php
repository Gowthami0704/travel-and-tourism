<?php

namespace App\Notifications;

use App\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VendorKycStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Vendor $vendor;
    public string $status; // 'approved' or 'rejected'
    public ?string $reason;
    public array $approvedDistricts;

    public function __construct(Vendor $vendor, string $status, ?string $reason = null, array $approvedDistricts = [])
    {
        $this->vendor = $vendor;
        $this->status = $status;
        $this->reason = $reason;
        $this->approvedDistricts = $approvedDistricts;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $businessName = $this->vendor->business_name;

        if ($this->status === 'approved') {
            $districtsText = !empty($this->approvedDistricts) 
                ? implode(', ', $this->approvedDistricts)
                : 'Tamil Nadu';

            return (new MailMessage)
                ->subject("🎉 Partnership Approved: {$businessName} is Live on TN Explore!")
                ->greeting("Hello {$this->vendor->owner_name},")
                ->line("Congratulations! Your partner application and KYC credentials for **{$businessName}** have been verified and approved by the TN Explore Tourism Administration.")
                ->line("Your business is now authorized to operate in the following approved district(s): **{$districtsText}**.")
                ->action('Access Vendor Hub', url('/vendor/login'))
                ->line('You can now log in using the email and password you chose during registration to create tour listings, manage bookings, and receive tourist leads.')
                ->salutation('Warm regards, The TN Explore Administration Team');
        }

        return (new MailMessage)
            ->subject("Update on your TN Explore Partner Application: {$businessName}")
            ->greeting("Hello {$this->vendor->owner_name},")
            ->line("Thank you for submitting your application to partner with TN Explore for **{$businessName}**.")
            ->line("After careful review of your submitted documents and business details, our administration team was unable to verify your application at this time.")
            ->line("**Reason for Decision:**")
            ->line("_{$this->reason}_")
            ->action('Review Application Status', url('/vendor/login'))
            ->line('You can log in to view your application status or submit updated valid documents for re-verification.')
            ->salutation('Warm regards, The TN Explore Administration Team');
    }
}
