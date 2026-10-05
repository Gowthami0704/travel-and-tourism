import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Star,
    ThumbsUp,
    ThumbsDown,
    ShieldCheck,
    MessageCircle,
    Calendar,
    Sparkles,
    CheckCircle2,
    Reply
} from 'lucide-react';

export default function ReviewList({ reviews = [], targetType = 'vendor', targetId, targetName, onOpenReviewModal }) {
    const [ratingFilter, setRatingFilter] = useState('all');
    const [sortBy, setSortBy] = useState('recent');

    // Calculate rating distribution
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / totalReviews).toFixed(1)
        : '5.0';

    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
        const star = Math.min(5, Math.max(1, Math.round(Number(r.rating || 5))));
        starCounts[star] = (starCounts[star] || 0) + 1;
    });

    // Filter & Sort
    let filteredReviews = reviews.filter(r => {
        if (ratingFilter === 'all') return true;
        return Number(r.rating) === Number(ratingFilter);
    });

    if (sortBy === 'highest') {
        filteredReviews.sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (sortBy === 'lowest') {
        filteredReviews.sort((a, b) => Number(a.rating) - Number(b.rating));
    } else if (sortBy === 'helpful') {
        filteredReviews.sort((a, b) => Number(b.helpful_count || 0) - Number(a.helpful_count || 0));
    } else {
        filteredReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    const handleVote = (reviewId, voteType) => {
        router.post(route('reviews.vote', reviewId), {
            vote: voteType,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <div className="space-y-6">

            {/* REVIEW HEADER & STAR DISTRIBUTION */}
            <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Score Column */}
                <div className="md:col-span-4 text-center md:text-left space-y-2">
                    <div className="flex items-baseline justify-center md:justify-start gap-2">
                        <span className="text-4xl sm:text-5xl font-black text-[var(--text)]">{avgRating}</span>
                        <span className="text-sm text-[var(--muted)]">/ 5.0</span>
                    </div>
                    <div className="flex justify-center md:justify-start text-amber-400 gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                                key={s}
                                className={`w-4 h-4 ${s <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-[var(--muted)]'}`}
                            />
                        ))}
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                        Based on {totalReviews} verified traveler ratings
                    </p>

                    {onOpenReviewModal && (
                        <button
                            onClick={onOpenReviewModal}
                            className="mt-2 px-4 py-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-[var(--primary-text)] font-bold text-xs shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Write a Review</span>
                        </button>
                    )}
                </div>

                {/* Distribution Bars */}
                <div className="md:col-span-8 space-y-1.5 text-xs text-[var(--text)]">
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = starCounts[star] || 0;
                        const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : star === 5 ? 100 : 0;
                        return (
                            <div key={star} className="flex items-center gap-2">
                                <span className="w-8 text-[11px] text-[var(--muted)] flex items-center gap-0.5">
                                    {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                </span>
                                <div className="flex-1 h-2 bg-[var(--bg)] border border-[var(--border)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <span className="w-10 text-[10px] text-[var(--muted)] text-right">{percent}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* FILTERS & SORT */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                    <button
                        onClick={() => setRatingFilter('all')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                            ratingFilter === 'all' ? 'bg-[var(--primary)] text-[var(--primary-text)] font-bold' : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                        }`}
                    >
                        All ({reviews.length})
                    </button>
                    {[5, 4, 3, 2, 1].map((s) => (
                        <button
                            key={s}
                            onClick={() => setRatingFilter(s.toString())}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                                ratingFilter === s.toString() ? 'bg-[var(--primary)] text-[var(--primary-text)] font-bold' : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                            }`}
                        >
                            <span>{s}★</span>
                            <span className="text-[10px] opacity-75">({starCounts[s] || 0})</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted)]">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] px-2.5 py-1 focus:ring-1 focus:ring-[var(--primary)]"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="helpful">Most Helpful</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                    </select>
                </div>
            </div>

            {/* REVIEWS LIST */}
            {filteredReviews.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] text-xs">
                    No reviews matching this star rating.
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReviews.map((rev) => (
                        <div key={rev.id} className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--primary)] flex items-center justify-center font-bold text-sm">
                                        {(rev.tourist?.name || 'Explorer').charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[var(--text)] text-sm">{rev.tourist?.name || 'Verified Explorer'}</span>
                                            <span className="px-2 py-0.2 rounded-full bg-[var(--verified)]/15 text-[var(--verified)] text-[10px] font-bold border border-[var(--verified)]/30 flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Verified Visit
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-[var(--muted)]">
                                            {rev.visit_date ? `Visited ${rev.visit_date}` : new Date(rev.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex text-amber-400">
                                    {[...Array(rev.rating || 5)].map((_, idx) => (
                                        <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                                    ))}
                                </div>
                            </div>

                            {rev.title && (
                                <h4 className="text-sm font-bold text-[var(--text)]">{rev.title}</h4>
                            )}

                            <p className="text-xs text-[var(--muted)] leading-relaxed">
                                {rev.comment}
                            </p>

                            {/* Tags */}
                            {rev.tags && rev.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {rev.tags.map((t, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded-md bg-[var(--bg)] border border-[var(--border)] text-[10px] text-[var(--muted)]">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Vendor Reply */}
                            {rev.vendor_reply && (
                                <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--verified)]/20 space-y-1 text-xs">
                                    <div className="flex items-center gap-1.5 text-[var(--verified)] font-bold text-[11px]">
                                        <Reply className="w-3.5 h-3.5" />
                                        <span>Response from {rev.vendor_reply.vendor_name || 'Vendor'}</span>
                                    </div>
                                    <p className="text-[var(--text)] text-[11px] leading-relaxed italic">
                                        "{rev.vendor_reply.text}"
                                    </p>
                                </div>
                            )}

                            {/* Helpful Upvote Controls */}
                            <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)]">
                                <span>Was this review helpful?</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleVote(rev.id, 'helpful')}
                                        className="px-2.5 py-1 rounded-lg bg-[var(--bg)] hover:bg-[var(--border)] text-[var(--text)] transition cursor-pointer flex items-center gap-1 border border-[var(--border)]"
                                    >
                                        <ThumbsUp className="w-3 h-3 text-[var(--verified)]" />
                                        <span>{rev.helpful_count || 0}</span>
                                    </button>
                                    <button
                                        onClick={() => handleVote(rev.id, 'not_helpful')}
                                        className="px-2.5 py-1 rounded-lg bg-[var(--bg)] hover:bg-[var(--border)] text-[var(--text)] transition cursor-pointer flex items-center gap-1 border border-[var(--border)]"
                                    >
                                        <ThumbsDown className="w-3 h-3 text-rose-500" />
                                        <span>{rev.not_helpful_count || 0}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
