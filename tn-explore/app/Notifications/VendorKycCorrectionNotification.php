<?php

namespace App\Notifications;

use App\Models\Vendor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class VendorKycCorrectionNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public Vendor $vendor;
    public array $checklistItems;
    public ?string $note;
    public ?string $deadlineDate;

    public function __construct(Vendor $vendor, array $checklistItems = [], ?string $note = null, ?string $deadlineDate = null)
    {
        $this->vendor = $vendor;
        $this->checklistItems = $checklistItems;
        $this->note = $note;
        $this->deadlineDate = $deadlineDate;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $businessName = $this->vendor->business_name;
        $deadlineText = $this->deadlineDate ? "Please complete and resubmit your changes before **{$this->deadlineDate}**." : "";

        // Friendly mapping of checklist items to safe general labels without sensitive data
        $itemLabels = [
            'owner_name_missing' => 'Owner name missing or needs clarification',
            'phone_missing' => 'Phone number missing or needs verification',
            'email_invalid' => 'Email address format or domain needs review',
            'aadhaar_unclear' => 'Aadhaar identity proof image is unclear or obscured; please re-upload a clear scan',
            'license_expired_unreadable' => 'Trade / Tourism license is expired, unreadable, or missing; please provide an updated copy',
            'photo_unclear' => 'Owner / Profile photograph is unclear or invalid; please upload a clear photo',
            'gstin_missing' => 'GSTIN certificate is invalid or missing',
            'district_proof_missing' => 'Operational proof for requested districts is required',
        ];

        $itemsSummary = array_map(function ($key) use ($itemLabels) {
            return $itemLabels[$key] ?? ucwords(str_replace('_', ' ', $key));
        }, $this->checklistItems);

        $mail = (new MailMessage)
            ->subject("⚠️ Action Required: Changes requested on your TN Explore application ({$businessName})")
            ->greeting("Hello {$this->vendor->owner_name},")
            ->line("The TN Explore Tourism Administration reviewed your partner application for **{$businessName}** and requires a few corrections before approval.");

        if (!empty($itemsSummary)) {
            $mail->line("**Items Requiring Correction:**");
            foreach ($itemsSummary as $item) {
                $mail->line("• {$item}");
            }
        }

        if (!empty($this->note)) {
            $mail->line("**Officer Instructions:**")
                 ->line("_{$this->note}_");
        }

        if ($deadlineText) {
            $mail->line($deadlineText);
        }

        $mail->action('Log In & Resubmit Application', url('/vendor/login'))
             ->line('Only the flagged fields need to be updated. Once submitted, your application will return directly to the admin verification queue.')
             ->salutation('Warm regards, The TN Explore Administration Team');

        // Optional provider-agnostic SMS alert behind config flag
        if (config('services.sms.enabled', false)) {
            $phone = $this->vendor->phone;
            $smsText = "Action needed on your TN Explore application for {$businessName}. Please log in at " . url('/vendor/login') . " to review requested changes.";
            Log::info("[SMS Notification] Dispatched to {$phone}: {$smsText}");
        }

        return $mail;
    }
}
