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
        <div className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-full animate-slideUp">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0F172A]/95 via-[#131E38]/95 to-[#0B1120]/95 backdrop-blur-xl border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20 text-white relative overflow-hidden">
                {/* Ambient Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                        <div className="relative w-9 h-9 rounded-xl bg-purple-950 border border-purple-400/40 flex items-center justify-center text-sm font-bold text-purple-300 flex-shrink-0">
                            {trip.creatorName?.charAt(0) || 'K'}
                            {trip.creatorVerified && (
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[#0A0E1A] flex items-center justify-center shadow-md">
                                    <ShieldCheck className="w-3 h-3 text-white" />
                                </span>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-white truncate max-w-[140px]">
                                    {trip.creatorName}
                                </span>
                                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30 flex items-center gap-0.5">
                                    <ShieldCheck className="w-2.5 h-2.5" />
                                    Verified
                                </span>
                            </div>
                            <span className="text-[10px] text-purple-300 font-medium">New Trip Mate Ad</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Message Body */}
                <p className="text-xs text-gray-200 leading-relaxed mb-3">
                    <strong className="text-white">{trip.creatorName}</strong> is looking for{' '}
                    <span className="text-gold font-bold">{trip.slotsNeeded - trip.slotsFilled} travel mates</span> for a{' '}
                    <span className="text-emerald-300 font-bold">{trip.district}</span> trip starting on{' '}
                    <span className="text-purple-300 font-bold">{new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>!
                </p>

                {/* Meta details */}
                <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3 bg-white/[0.03] p-2 rounded-lg border border-white/5">
                    <span className="flex items-center gap-1 text-gray-300">
                        <MapPin className="w-3 h-3 text-gold" />
                        {trip.district}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-300">
                        <Users className="w-3 h-3 text-purple-400" />
                        {trip.slotsFilled}/{trip.slotsNeeded} Slots
                    </span>
                    {trip.estimatedBudget && (
                        <>
                            <span>•</span>
                            <span className="font-bold text-gold">~₹{trip.estimatedBudget}</span>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {joined ? (
                        <div className="w-full py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                            <Check className="w-4 h-4" />
                            <span>Join Request Sent to {trip.creatorName}!</span>
                        </div>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleJoin}
                                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-gold via-amber-300 to-gold text-[#0A0E1A] text-xs font-extrabold shadow-lg shadow-gold/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Sparkles className="w-3.5 h-3.5 fill-current" />
                                <span>Join Trip</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleClose}
                                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                            >
                                Ignore
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
