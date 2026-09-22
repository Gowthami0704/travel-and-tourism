import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Star,
    Sparkles,
    X,
    Calendar,
    Tag,
    Camera,
    CheckCircle2,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';

export default function ReviewFormModal({ targetType = 'vendor', targetId, targetName, isOpen, onClose }) {
    if (!isOpen) return null;

    const [hoverRating, setHoverRating] = useState(0);

    const vendorTags = ['Good Value', 'Friendly', 'Punctual', 'Clean', 'Professional', 'Safe', 'Knowledgeable'];
    const placeTags = ['Scenic', 'Well Maintained', 'Family Friendly', 'Crowded', 'Easy Access', 'Hidden Gem', 'Historic'];
    const availableTags = targetType === 'vendor' ? vendorTags : placeTags;

    const { data, setData, post, processing, errors, reset } = useForm({
        target_type: targetType,
        target_id: targetId,
        rating: 5,
        title: '',
        comment: '',
        photos: [],
        tags: ['Good Value', 'Friendly'],
        visit_date: new Date().toISOString().split('T')[0],
    });

    const toggleTag = (tag) => {
        if (data.tags.includes(tag)) {
            setData('tags', data.tags.filter(t => t !== tag));
        } else {
            setData('tags', [...data.tags, tag]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('reviews.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
            <div className="relative w-full max-w-lg bg-[#0E1526] border border-white/10 rounded-3xl shadow-2xl p-6 text-white my-8 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Verified Traveler Review</span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-0.5">Write Review for {targetName}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* STAR RATING PICKER */}
                    <div className="text-center p-3 rounded-2xl bg-slate-950 border border-white/5 space-y-1.5">
                        <span className="text-xs text-gray-400 font-semibold block">Rate your experience</span>
                        <div className="flex items-center justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setData('rating', star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 transition-transform hover:scale-125 cursor-pointer"
                                >
                                    <Star
                                        className={`w-8 h-8 ${
                                            (hoverRating || data.rating) >= star
                                                ? 'text-gold fill-gold drop-shadow-md'
                                                : 'text-gray-600'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="text-xs text-gold font-bold">
                            {data.rating === 5 ? '⭐⭐⭐⭐⭐ Exceptional / Outstanding' :
                             data.rating === 4 ? '⭐⭐⭐⭐ Very Good' :
                             data.rating === 3 ? '⭐⭐⭐ Average Experience' :
                             data.rating === 2 ? '⭐⭐ Disappointing' : '⭐ Poor'}
                        </span>
                    </div>

                    {/* TITLE */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Headline / Short Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Wonderful heritage tour with guide Sundaram!"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full p-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                        />
                    </div>

                    {/* REVIEW TEXT */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Detailed Review & Tips for Fellow Travelers</label>
                        <textarea
                            rows="3"
                            required
                            placeholder="Share specific highlights regarding guide knowledge, bus comfort, food stops, or timings..."
                            value={data.comment}
                            onChange={(e) => setData('comment', e.target.value)}
                            className="w-full p-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
                        />
                        {errors.comment && <p className="text-xs text-red-400 mt-1">{errors.comment}</p>}
                    </div>

                    {/* TAGS MULTI-SELECT */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center justify-between">
                            <span>Experience Tags (Select 2-5)</span>
                            <span className="text-[10px] text-emerald-400">{data.tags.length} selected</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {availableTags.map((tag) => {
                                const isSelected = data.tags.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                            isSelected
                                                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                                                : 'bg-white/5 text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* VISIT DATE */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">Date of Experience</label>
                        <input
                            type="date"
                            value={data.visit_date}
                            onChange={(e) => setData('visit_date', e.target.value)}
                            className="w-full p-2 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            <span>{processing ? 'Publishing...' : 'Submit Verified Review'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
