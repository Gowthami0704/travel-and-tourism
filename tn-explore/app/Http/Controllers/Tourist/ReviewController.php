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
            return back()->withErrors(['auth' => 'You must be signed in to submit a verified review.']);
        }

        // Support both direct vendor_id / place_id or target_type / target_id payloads
        $targetType = $request->target_type ?? ($request->has('vendor_id') ? 'vendor' : ($request->has('place_id') ? 'place' : 'vendor'));
        $targetId = (int)($request->target_id ?? ($targetType === 'vendor' ? $request->vendor_id : $request->place_id));

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:100',
            'comment' => 'required|string|min:5|max:1500',
            'photos' => 'nullable|array',
            'tags' => 'nullable|array',
            'visit_date' => 'nullable|date',
            'district_id' => 'nullable|exists:districts,id',
        ]);

        // 1. Eligibility Check: only tourists with completed bookings can review
        if ($targetType === 'vendor') {
            $hasCompletedBooking = Booking::where('tourist_id', $user->id)
                ->whereHas('listing', fn($q) => $q->where('vendor_id', $targetId))
                ->where('status', 'completed')
                ->exists();

            if (!$hasCompletedBooking && !$user->isAdmin()) {
                return back()->withErrors([
                    'booking' => 'Only verified travelers with completed bookings with this partner can leave reviews.',
                    'error' => 'Only verified travelers with completed bookings with this partner can leave reviews.',
                ]);
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

        $districtId = $request->district_id;
        if (!$districtId && $targetType === 'vendor') {
            $districtId = Vendor::find($targetId)?->district_id;
        }

        $review = Review::create([
            'tourist_id' => $user->id,
            'vendor_id' => ($targetType === 'vendor') ? $targetId : null,
            'district_id' => $districtId,
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

        // Recalculate vendor dynamic trust score
        if ($targetType === 'vendor') {
            $vendor = Vendor::find($targetId);
            if ($vendor) {
                $avgRating = Review::where('vendor_id', $vendor->id)->avg('rating') ?? 4.0;
                $vendor->trust_score = min(0.99, max(0.50, ($avgRating / 5.0) * 0.95));
                $vendor->save();
            }
        }

        return back()->with('success', 'Thank you! Your verified review has been published.');
    }

    public function vote(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Sign in to upvote reviews'], 401);
        }

        $request->validate([
            'is_helpful' => 'required|boolean',
        ]);

        $vote = ReviewVote::updateOrCreate(
            ['review_id' => $id, 'user_id' => $user->id],
            ['is_helpful' => $request->is_helpful]
        );

        $helpful = ReviewVote::where('review_id', $id)->where('is_helpful', true)->count();
        $notHelpful = ReviewVote::where('review_id', $id)->where('is_helpful', false)->count();

        Review::where('id', $id)->update([
            'helpful_count' => $helpful,
            'not_helpful_count' => $notHelpful,
        ]);

        return response()->json([
            'success' => true,
            'helpful_count' => $helpful,
            'not_helpful_count' => $notHelpful,
        ]);
    }

    public function vendorReply(Request $request, $id): RedirectResponse
    {
        $vendor = Auth::user()?->vendor;
        if (!$vendor) {
            abort(403, 'Only verified vendors can reply to reviews.');
        }

        $request->validate([
            'reply' => 'required|string|min:5|max:1000',
        ]);

        $review = Review::where('vendor_id', $vendor->id)->findOrFail($id);
        $review->update([
            'vendor_reply' => [
                'text' => $request->reply,
                'author' => $vendor->business_name,
                'created_at' => now()->toISOString(),
            ]
        ]);

        return back()->with('success', 'Official vendor response posted.');
    }
}
