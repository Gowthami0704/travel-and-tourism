<?php

namespace App\Http\Controllers;

use App\Models\TripChat;
use App\Models\TripMessage;
use App\Models\TripProposal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TripChatController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = TripChat::with([
            'customTrip',
            'proposal.vendor',
            'tourist',
            'vendor.district',
            'messages' => function ($q) {
                $q->latest()->limit(1);
            }
        ]);

        if ($user->isVendor() && $user->vendor) {
            $query->where('vendor_id', $user->vendor->id);
        } else {
            $query->where('tourist_id', $user->id);
        }

        $chats = $query->orderBy('last_message_at', 'desc')->get();

        return Inertia::render('Chat/TripChatIndex', [
            'chats' => $chats,
            'isVendor' => $user->isVendor(),
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        $chat = TripChat::with([
            'customTrip.user',
            'proposal.vendor.district',
            'tourist',
            'vendor.user',
            'vendor.district',
            'messages.sender',
        ])->findOrFail($id);

        // Security check: must be the tourist, the vendor, or an admin
        $isParticipant = ($chat->tourist_id === $user->id) || 
                         ($user->isVendor() && $user->vendor && $chat->vendor_id === $user->vendor->id) ||
                         $user->isAdmin();

        if (!$isParticipant) {
            abort(403, 'Unauthorized access to this chat session.');
        }

        // Mark incoming unread messages as read
        TripMessage::where('chat_id', $chat->id)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return Inertia::render('Chat/TripChatRoom', [
            'chat' => $chat,
            'currentUserId' => $user->id,
            'currentUserRole' => $user->isVendor() ? 'vendor' : ($user->isAdmin() ? 'admin' : 'tourist'),
        ]);
    }

    public function sendMessage(Request $request, $id)
    {
        $user = $request->user();
        $chat = TripChat::findOrFail($id);

        $isParticipant = ($chat->tourist_id === $user->id) || 
                         ($user->isVendor() && $user->vendor && $chat->vendor_id === $user->vendor->id) ||
                         $user->isAdmin();

        if (!$isParticipant) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'message' => 'required|string|max:3000',
            'attachment_url' => 'nullable|string|url',
            'custom_quote_payload' => 'nullable|array',
        ]);

        $senderRole = $user->isVendor() ? 'vendor' : ($user->isAdmin() ? 'admin' : 'tourist');

        $message = TripMessage::create([
            'chat_id' => $chat->id,
            'sender_id' => $user->id,
            'sender_role' => $senderRole,
            'message' => $validated['message'],
            'attachment_url' => $validated['attachment_url'] ?? null,
            'custom_quote_payload' => $validated['custom_quote_payload'] ?? null,
        ]);

        $chat->update(['last_message_at' => now()]);

        // If this message had a revised price quote payload from vendor, update the proposal too
        if (!empty($validated['custom_quote_payload']) && $chat->proposal && $senderRole === 'vendor') {
            $payload = $validated['custom_quote_payload'];
            if (isset($payload['price'])) {
                $chat->proposal->update([
                    'quote_price' => $payload['price'],
                    'inclusions' => $payload['inclusions'] ?? $chat->proposal->inclusions,
                    'vendor_message' => $validated['message'],
                ]);
            }
        }

        return back()->with('success', 'Message sent.');
    }

    public function sendQuoteMessage(Request $request, $id)
    {
        $user = $request->user();
        $chat = TripChat::with('proposal')->findOrFail($id);

        if (!$user->isVendor() || !$user->vendor || $chat->vendor_id !== $user->vendor->id) {
            abort(403, 'Only the designated vendor can submit a revised quote.');
        }

        $validated = $request->validate([
            'price' => 'required|numeric|min:100',
            'vehicle_model' => 'nullable|string|max:255',
            'hotel_category' => 'nullable|string|max:255',
            'inclusions' => 'required|array|min:1',
            'notes' => 'nullable|string|max:1000',
        ]);

        $quotePayload = [
            'price' => (float) $validated['price'],
            'vehicle_model' => $validated['vehicle_model'] ?? 'AC Dedicated Vehicle',
            'hotel_category' => $validated['hotel_category'] ?? 'Verified Stay',
            'inclusions' => $validated['inclusions'],
            'notes' => $validated['notes'] ?? '',
            'status' => 'open_for_acceptance',
            'submitted_at' => now()->toDateTimeString(),
        ];

        $messageText = "⚡ Official Revised Quotation: ₹" . number_format($validated['price']) . 
                       " | Vehicle: " . ($validated['vehicle_model'] ?? 'AC Dedicated Cab') .
                       " | Stay: " . ($validated['hotel_category'] ?? 'Verified Hotel');

        if (!empty($validated['notes'])) {
            $messageText .= "\nNotes: " . $validated['notes'];
        }

        $message = TripMessage::create([
            'chat_id' => $chat->id,
            'sender_id' => $user->id,
            'sender_role' => 'vendor',
            'message' => $messageText,
            'custom_quote_payload' => $quotePayload,
        ]);

        if ($chat->proposal) {
            $chat->proposal->update([
                'quote_price' => $validated['price'],
                'inclusions' => $validated['inclusions'],
                'vendor_message' => $validated['notes'] ?? $chat->proposal->vendor_message,
            ]);
        }

        $chat->update(['last_message_at' => now()]);

        return back()->with('success', 'Revised quote card submitted to traveler.');
    }

    public function acceptInChatQuote(Request $request, $chatId, $messageId)
    {
        $user = $request->user();
        $chat = TripChat::with(['customTrip', 'proposal'])->findOrFail($chatId);

        if ($chat->tourist_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Only the tourist traveler can accept this quote.');
        }

        $message = TripMessage::where('chat_id', $chat->id)->findOrFail($messageId);
        $quotePayload = $message->custom_quote_payload;

        if (empty($quotePayload)) {
            return back()->with('error', 'No quote details found on this message.');
        }

        // 1. Update Custom Trip status to booked
        $chat->customTrip->update([
            'status' => 'booked',
        ]);

        // 2. Update the proposal to accepted & decline others
        if ($chat->proposal) {
            $chat->proposal->update([
                'status' => 'accepted',
                'quote_price' => $quotePayload['price'] ?? $chat->proposal->quote_price,
                'inclusions' => $quotePayload['inclusions'] ?? $chat->proposal->inclusions,
            ]);

            TripProposal::where('custom_trip_id', $chat->custom_trip_id)
                ->where('id', '!=', $chat->proposal->id)
                ->update(['status' => 'declined']);
        }

        // 3. Post a system confirmation message in chat
        $finalPrice = number_format($quotePayload['price'] ?? ($chat->proposal->quote_price ?? 0));
        TripMessage::create([
            'chat_id' => $chat->id,
            'sender_id' => $user->id,
            'sender_role' => 'tourist',
            'message' => "🎉 DEAL ACCEPTED & BOOKED! Custom trip finalized at ₹{$finalPrice}. Both parties can now coordinate pickup location and schedules.",
            'custom_quote_payload' => array_merge($quotePayload, ['status' => 'accepted_and_booked']),
        ]);

        $chat->update(['last_message_at' => now()]);

        return back()->with('success', "🎉 Deal Accepted! Custom trip is now booked & finalized.");
    }
}
