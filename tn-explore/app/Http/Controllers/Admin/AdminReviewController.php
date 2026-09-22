<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Review::with(['tourist', 'vendor', 'place']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('sentiment')) {
            $query->where('sentiment', $request->sentiment);
        }

        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->boolean('flagged_only')) {
            $query->where('spam_score', '>=', 50)->orWhere('abuse_score', '>=', 50);
        }

        $reviews = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString();

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews,
            'filters' => $request->only(['status', 'sentiment', 'rating', 'flagged_only']),
            'pendingCount' => Review::where('status', 'pending')->count(),
            'flaggedCount' => Review::where('spam_score', '>=', 50)->count(),
        ]);
    }

    public function updateStatus(Request $request, $id): RedirectResponse
    {
        $review = Review::findOrFail($id);
        $request->validate([
            'status' => 'required|in:approved,hidden,deleted,pending',
        ]);

        $review->update(['status' => $request->status]);

        AuditLog::log(
            "review_status_{$request->status}",
            'review',
            $review->id,
            "Admin set review #{$review->id} status to {$request->status}"
        );

        return back()->with('success', "Review #{$review->id} marked as " . ucfirst($request->status));
    }

    public function destroy($id): RedirectResponse
    {
        $review = Review::findOrFail($id);
        $review->delete();

        AuditLog::log('review_deleted', 'review', $id, "Deleted review #{$id}");

        return back()->with('success', "Review deleted permanently.");
    }
}
