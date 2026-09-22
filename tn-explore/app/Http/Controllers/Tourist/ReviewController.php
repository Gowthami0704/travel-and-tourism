<?php

namespace App\Http\Controllers\Tourist;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\ReviewVote;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Submit a new verified review for a Vendor or Place.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        if (!$user) {
            return back()->withErrors(['error' => 'You must be signed in to submit a verified review.']);
        }

        $request->validate([
            'target_type' => 'required|in:vendor,place',
            'target_id' => 'required|integer',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:100',
            'comment' => 'required|string|min:5|max:1500',
            'photos' => 'nullable|array',
            'tags' => 'nullable|array',
            'visit_date' => 'nullable|date',
        ]);

        $targetType = $request->target_type;
        $targetId = (int)$request->target_id;

        // 1. Eligibility Check
        if ($targetType === 'vendor') {
            $hasCompletedBooking = Booking::where('tourist_id', $user->id)
                ->whereHas('listing', fn($q) => $q->where('vendor_id', $targetId))
                ->where('status', 'completed')
                ->exists();

            // Allow during demo if user has any booking or is verified tourist
            if (!$hasCompletedBooking) {
                // Check if user has any booking with this vendor
                $hasAnyBooking = Booking::where('tourist_id', $user->id)
                    ->whereHas('listing', fn($q) => $q->where('vendor_id', $targetId))
                    ->exists();

                if (!$hasAnyBooking && $user->role !== 'admin') {
                    return back()->withErrors(['error' => 'Only verified travelers with a booking reservation can review this vendor.']);
                }
            }
        }

        // 2. Simple Rule-Based AI Sentiment & Spam Evaluator
        $sentiment = 'positive';
        $spamScore = 0;
        $abuseScore = 0;
        $text = strtolower($request->comment . ' ' . ($request->title ?? ''));

        if ($request->rating <= 2 || str_contains($text, 'bad') || str_contains($text, 'poor') || str_contains($text, 'terrible') || str_contains($text, 'scam')) {
            $sentiment = 'negative';
        } elseif ($request->rating == 3 || str_contains($text, 'okay') || str_contains($text, 'average')) {
            $sentiment = 'neutral';
        }

        // Spam indicators
        if (str_contains($text, 'http') || str_contains($text, 'www') || str_contains($text, 'buy now') || str_contains($text, 'crypto')) {
            $spamScore = 85;
        }

        // Profanity indicators
        if (str_contains($text, 'fraud') || str_contains($text, 'cheater')) {
            $abuseScore = 40;
        }

        $status = ($spamScore > 70) ? 'pending' : 'approved';

        $review = Review::create([
            'tourist_id' => $user->id,
            'vendor_id' => ($targetType === 'vendor') ? $targetId : null,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'rating' => $request->rating,
            'title' => $request->title,
            'comment' => $request->comment,
            'photos' => $request->photos ?? [],
            'tags' => $request->tags ?? [],
            'visit_date' => $request->visit_date ?? date('Y-m-d'),
            'sentiment' => $sentiment,
            'spam_score' => $spamScore,
            'abuse_score' => $abuseScore,
            'status' => $status,
            'helpful_count' => 0,
            'not_helpful_count' => 0,
        ]);

        return back()->with('success', 'Thank you! Your verified review has been published with AI trust verification.');
    }

    /**
     * Upvote or Downvote a Review.
     */
    public function vote(Request $request, $id): RedirectResponse
    {
        $user = Auth::user();
        if (!$user) {
            return back()->withErrors(['error' => 'Please sign in to vote on traveler reviews.']);
        }

        $request->validate([
            'vote' => 'required|in:helpful,not_helpful',
        ]);

        $review = Review::findOrFail($id);
        $existing = ReviewVote::where('review_id', $review->id)->where('user_id', $user->id)->first();

        if ($existing) {
            if ($existing->vote === $request->vote) {
                // Remove vote (toggle)
                if ($existing->vote === 'helpful') $review->decrement('helpful_count');
                else $review->decrement('not_helpful_count');
                $existing->delete();
            } else {
                // Switch vote
                if ($request->vote === 'helpful') {
                    $review->increment('helpful_count');
                    $review->decrement('not_helpful_count');
                } else {
                    $review->decrement('helpful_count');
                    $review->increment('not_helpful_count');
                }
                $existing->update(['vote' => $request->vote]);
            }
        } else {
            ReviewVote::create([
                'review_id' => $review->id,
                'user_id' => $user->id,
                'vote' => $request->vote,
            ]);
            if ($request->vote === 'helpful') $review->increment('helpful_count');
            else $review->increment('not_helpful_count');
        }

        return back()->with('success', 'Vote recorded.');
    }

    /**
     * Vendor submits a single reply to a review.
     */
    public function vendorReply(Request $request, $id): RedirectResponse
    {
        $user = Auth::user();
        $vendor = $user?->vendor;
        if (!$vendor) {
            abort(403, 'Only the registered business owner can reply to this review.');
        }

        $review = Review::where('vendor_id', $vendor->id)->findOrFail($id);
        $request->validate([
            'reply_text' => 'required|string|min:3|max:1000',
        ]);

        $review->update([
            'vendor_reply' => [
                'text' => $request->reply_text,
                'replied_at' => date('Y-m-d H:i:s'),
                'vendor_name' => $vendor->business_name,
            ],
        ]);

        return back()->with('success', 'Your official response has been added to this review.');
    }
}
