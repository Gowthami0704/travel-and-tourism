import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, X, Users, MapPin, Calendar, Check, ArrowRight } from 'lucide-react';
import { applyToTrip } from '@/Utils/tripMatesStorage';

export default function TripMateToast({ trip, currentUser, onJoined, onDismiss }) {
    const [visible, setVisible] = useState(true);
    const [joined, setJoined] = useState(false);

    if (!trip || !visible) return null;

    const handleJoin = () => {
        const res = applyToTrip(trip.id, currentUser, 'Hey! I saw your trip notification and would love to join.');
        setJoined(true);
        if (onJoined) onJoined(trip);
        setTimeout(() => {
            setVisible(false);
            if (onDismiss) onDismiss();
        }, 2200);
    };

    const handleClose = () => {
        setVisible(false);
        if (onDismiss) onDismiss();
    };

    return (
        <div className="fixed bottom-24 right-4 sm:right-6 z-40 max-w-sm sm:max-w-md w-full animate-slideUp">
            <div className="p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl border border-stone-200 dark:border-stone-700 shadow-2xl shadow-stone-900/15 text-stone-900 dark:text-white relative overflow-hidden">
                {/* Ambient Glow */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 dark:bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                        <div className="relative w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-sm font-bold text-purple-700 dark:text-purple-300 flex-shrink-0 shadow-sm">
                            {trip.creatorName?.charAt(0) || 'K'}
                            {trip.creatorVerified && (
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                                    <ShieldCheck className="w-3 h-3 text-white" />
                                </span>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-sm text-stone-900 dark:text-white truncate max-w-[150px]">
                                    {trip.creatorName}
                                </span>
                                <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-0.5">
                                    <ShieldCheck className="w-3 h-3" />
                                    Verified
                                </span>
                            </div>
                            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1 mt-0.5">
                                <Sparkles className="w-3 h-3 text-purple-500 animate-pulse" />
                                New Trip Mate Ad
                            </span>
                        </div>
                    </div>

                    {/* Top Right Close / Dismiss button */}
                    <button
                        type="button"
                        onClick={handleClose}
                        title="Dismiss notification"
                        className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Message Body */}
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 leading-relaxed mb-3.5">
                    <strong className="text-stone-900 dark:text-white">{trip.creatorName}</strong> is looking for{' '}
                    <span className="text-amber-700 dark:text-amber-400 font-bold">{trip.slotsNeeded - trip.slotsFilled} travel mates</span> for a{' '}
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">{trip.district}</span> trip starting on{' '}
                    <span className="text-purple-700 dark:text-purple-400 font-bold">{new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>!
                </p>

                {/* Meta details */}
                <div className="flex items-center gap-3 text-[11px] text-stone-600 dark:text-stone-400 mb-4 bg-[#FAF7F0] dark:bg-stone-800/70 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700">
                    <span className="flex items-center gap-1 text-stone-800 dark:text-stone-200 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        {trip.district}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-stone-800 dark:text-stone-200 font-medium">
                        <Users className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        {trip.slotsFilled}/{trip.slotsNeeded} Slots
                    </span>
                    {trip.estimatedBudget && (
                        <>
                            <span>•</span>
                            <span className="font-bold text-amber-700 dark:text-amber-400 font-mono">~₹{trip.estimatedBudget}</span>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5">
                    {joined ? (
                        <div className="w-full py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm">
                            <Check className="w-4 h-4" />
                            <span>Join Request Sent to {trip.creatorName}!</span>
                        </div>
                    ) : (
                        <>
                            {/* Join Trip button */}
                            <button
                                type="button"
                                onClick={handleJoin}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-extrabold shadow-md shadow-amber-500/20 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Sparkles className="w-4 h-4 fill-current" />
                                <span>Join Trip</span>
                            </button>

                            {/* Ignore Option Button */}
                            <button
                                type="button"
                                onClick={handleClose}
                                className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:scale-102 active:scale-98"
                            >
                                <X className="w-3.5 h-3.5 text-stone-500" />
                                <span>Ignore</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
