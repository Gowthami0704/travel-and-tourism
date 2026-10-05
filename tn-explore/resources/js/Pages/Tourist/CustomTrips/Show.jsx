import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Compass, ArrowLeft, CheckCircle2, Clock, ShieldCheck, MapPin, 
    Calendar, Users, IndianRupee, MessageSquare, Star, Award, 
    Check, X, Car, Hotel, Utensils, Sparkles, Building2, AlertTriangle,
    Layers, Columns3, CheckCircle, ExternalLink, Phone, MessageCircle, Mail
} from 'lucide-react';

export default function CustomTripShow({ auth, trip }) {
    const { post: postAction, processing: isActionPending } = useForm();
    const [compareModalOpen, setCompareModalOpen] = useState(false);

    const acceptedProposal = trip.proposals?.find(p => p.status === 'accepted');
    const hasMultipleProposals = trip.proposals && trip.proposals.length >= 2;
    const lowestPriceProposal = trip.proposals && trip.proposals.length > 0 
        ? [...trip.proposals].sort((a, b) => parseFloat(a.quote_price) - parseFloat(b.quote_price))[0] 
        : null;

    const handleAcceptProposal = (proposalId, price, vendorName) => {
        const vendorText = vendorName ? vendorName : 'this vendor';
        let confirmMsg = `Are you sure you want to accept ${vendorText}'s proposal for ₹${Number(price).toLocaleString()} and finalize the booking?`;
        if (trip.status === 'booked' && acceptedProposal && acceptedProposal.id !== proposalId) {
            confirmMsg = `You already accepted ${acceptedProposal.vendor?.business_name || 'another vendor'}.\n\nDo you want to switch to ${vendorText} for ₹${Number(price).toLocaleString()}?\n(Only 1 vendor can be active at a time).`;
        }
        if (confirm(confirmMsg)) {
            postAction(route('custom-trips.accept', [trip.id, proposalId]));
        }
    };

    const handleDismissProposal = (proposalId, vendorName, isAccepted) => {
        const vendorText = vendorName ? vendorName : 'this vendor';
        const confirmMsg = isAccepted
            ? `Are you sure you want to dismiss ${vendorText} as your active vendor?\n\nThis will re-open all proposals so you can select another vendor.`
            : `Are you sure you want to dismiss the proposal from ${vendorText}?`;
        if (confirm(confirmMsg)) {
            postAction(route('custom-trips.dismiss', [trip.id, proposalId]));
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <Head title={`${trip.title} | Custom Trip Details`} />

            {/* Header */}
            <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link 
                            href={route('dashboard')} 
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 flex items-center gap-1.5 text-xs font-semibold transition-all shadow-sm group"
                            title="Back to Tourist Dashboard"
                        >
                            <span className="text-emerald-400 group-hover:-translate-x-0.5 transition-transform">←</span>
                            <span>Home Dashboard</span>
                        </Link>
                        <Link 
                            href={route('custom-trips.index')} 
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Back to All Requests"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <span className="font-bold text-base text-white truncate max-w-xs sm:max-w-md hidden md:inline-block">
                            {trip.title}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {hasMultipleProposals && (
                            <button
                                type="button"
                                onClick={() => setCompareModalOpen(true)}
                                className="text-xs px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5 transition-all shadow-sm"
                            >
                                <Columns3 className="w-3.5 h-3.5" />
                                <span>Compare Quotes</span>
                            </button>
                        )}
                        <Link 
                            href={route('custom-trips.create')} 
                            className="text-xs px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all"
                        >
                            + New Request
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {/* Trip Summary Card */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    {trip.trip_type.replace('_', ' ')} Trip
                                </span>
                                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                    User ID: #{trip.user_id || auth?.user?.id}
                                </span>
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                    Trip #{trip.id}
                                </span>
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                    Region: {trip.destination_region.replace('_', ' ')}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                                {trip.title}
                            </h1>
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>{Array.isArray(trip.destinations) ? trip.destinations.join(' • ') : trip.destinations}</span>
                            </div>
                        </div>

                        {/* Status banner */}
                        <div className="shrink-0">
                            {trip.status === 'pending_verification' && (
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs max-w-sm">
                                    <div className="flex items-center gap-2 font-bold mb-1">
                                        <Clock className="w-4 h-4 text-amber-400" />
                                        Pending Admin Verification
                                    </div>
                                    Our admin moderation team is reviewing this request to ensure sanity and safety. Once approved, verified regional vendors will submit custom quotes.
                                </div>
                            )}

                            {trip.status === 'verified_active' && (
                                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs max-w-sm">
                                    <div className="flex items-center gap-2 font-bold mb-1">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        Verified & Open for Vendor Quotes
                                    </div>
                                    Certified tour vendors are currently reviewing your itinerary and submitting customized pricing with inclusions below.
                                </div>
                            )}

                            {trip.status === 'booked' && (
                                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs max-w-sm">
                                    <div className="flex items-center gap-2 font-bold mb-1">
                                        <ShieldCheck className="w-4 h-4 text-blue-400" />
                                        Proposal Finalized & Booked
                                    </div>
                                    You have accepted a vendor's proposal. Use the in-app chat to coordinate your pickup and day-to-day schedule.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Requirements Breakdown Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                        <div>
                            <span className="block text-slate-500 text-[11px]">DURATION & DATES</span>
                            <span className="font-bold text-slate-200">{trip.duration_days} Days</span>
                            {trip.start_date && (
                                <span className="block text-slate-400 text-[10px]">{new Date(trip.start_date).toLocaleDateString()}</span>
                            )}
                        </div>
                        <div>
                            <span className="block text-slate-500 text-[11px]">TRAVELERS</span>
                            <span className="font-bold text-slate-200">{trip.adults_count} Adults {trip.children_count > 0 ? `+ ${trip.children_count} Kids` : ''}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-[11px]">BUDGET TARGET</span>
                            <span className="font-bold text-emerald-400">₹{Number(trip.budget_min).toLocaleString()} - ₹{Number(trip.budget_max).toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-[11px]">ACCOMMODATION & CAB</span>
                            <span className="font-bold text-slate-200 capitalize">{trip.accommodation_pref.replace('_', ' ')} • {trip.transport_pref.replace('_', ' ')}</span>
                        </div>
                    </div>

                    {/* Notes & Required Inclusions */}
                    {trip.notes && (
                        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
                            <strong className="text-slate-300">Tourist Special Request:</strong> {trip.notes}
                        </div>
                    )}
                </div>

                {/* BOOKING CONFIRMED & DIRECT CONTACT CARD */}
                {trip.status === 'booked' && acceptedProposal && (
                    <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/30 border-2 border-emerald-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span>Official Confirmed Booking • Agreement Finalized</span>
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-tight">
                                    {acceptedProposal.vendor?.business_name}
                                </h2>
                                <p className="text-sm text-slate-300 max-w-xl">
                                    Your package is locked in at <strong className="text-emerald-400">₹{Number(acceptedProposal.quote_price).toLocaleString()}</strong> with <span className="text-slate-100 font-semibold">{acceptedProposal.vehicle_model}</span> & <span className="text-slate-100 font-semibold">{acceptedProposal.hotel_category}</span>.
                                </p>
                                <div className="text-xs text-slate-400 flex items-center gap-3 pt-1">
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gold/80" /> {acceptedProposal.vendor?.district?.name || 'Tamil Nadu'}</span>
                                    <span>•</span>
                                    <span className="text-emerald-400 font-semibold">⭐ {Math.round((acceptedProposal.vendor?.trust_score || 0.85) * 100)}% Trust Rating</span>
                                </div>
                            </div>

                            {/* Direct Contact Actions */}
                            <div className="flex flex-wrap items-center gap-3">
                                {acceptedProposal.vendor?.phone && (
                                    <a
                                        href={`tel:${acceptedProposal.vendor.phone}`}
                                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span>Call Vendor ({acceptedProposal.vendor.phone})</span>
                                    </a>
                                )}
                                <a
                                    href={`https://wa.me/91${(acceptedProposal.vendor?.phone || '9840123456').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${acceptedProposal.vendor?.business_name}, I booked Custom Trip #${trip.id} (${trip.title}) on TN Explore. Let's coordinate pickup timing!`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-green-600/20 transition-all cursor-pointer"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>WhatsApp Direct</span>
                                </a>
                                {acceptedProposal.chat && (
                                    <Link
                                        href={route('trip-chats.show', acceptedProposal.chat.id)}
                                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center gap-2 border border-emerald-500/30 transition-all"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span>Live In-App Chat</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Section: Received Vendor Proposals */}
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-emerald-400" />
                                Vendor Proposals & Customized Offers
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20">
                                    {trip.proposals.length} Submitted
                                </span>
                            </h2>
                            <p className="text-slate-400 text-xs mt-0.5">
                                Compare price, vehicle models, hotel star tiers, inclusions checklist, and chat directly to negotiate.
                            </p>
                        </div>

                        {hasMultipleProposals && (
                            <button
                                type="button"
                                onClick={() => setCompareModalOpen(true)}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md self-start sm:self-auto"
                            >
                                <Columns3 className="w-4 h-4 text-emerald-400" />
                                <span>Compare Proposals Side-by-Side</span>
                            </button>
                        )}
                    </div>

                    {trip.proposals.length === 0 ? (
                        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center">
                            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                            <h4 className="text-sm font-bold text-slate-300 mb-1">Awaiting Vendor Proposals</h4>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Verified regional vendors are being notified of your trip parameters. Proposals will appear here with price quotes, inclusions checklist, and chat options.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {trip.proposals.map(prop => {
                                const vendor = prop.vendor;
                                const isAccepted = prop.status === 'accepted';
                                const isLowest = lowestPriceProposal && lowestPriceProposal.id === prop.id && trip.proposals.length > 1;
                                const trustScore = Math.round((vendor?.trust_score || 0.85) * 100);

                                return (
                                    <div 
                                        key={prop.id}
                                        className={`bg-slate-900/90 border rounded-2xl p-6 transition-all flex flex-col justify-between shadow-2xl relative ${
                                            isAccepted 
                                                ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/30' 
                                                : 'border-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        {isAccepted && (
                                            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Accepted Proposal
                                            </div>
                                        )}

                                        {isLowest && !isAccepted && (
                                            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1 shadow-lg shadow-amber-500/20">
                                                <Sparkles className="w-3.5 h-3.5" />
                                                Best Value Quote
                                            </div>
                                        )}

                                        <div>
                                            {/* Vendor Header */}
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-lg overflow-hidden shrink-0">
                                                        {vendor?.logo_url ? (
                                                            <img src={vendor.logo_url} alt={vendor.business_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            vendor?.business_name?.substring(0, 2) || 'VN'
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white text-base leading-tight">
                                                            {vendor?.business_name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                                <MapPin className="w-2.5 h-2.5 text-gold/80" />
                                                                <span>{vendor?.district?.name || 'South India'}</span>
                                                            </span>
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20 flex items-center gap-1">
                                                                <Award className="w-3 h-3 text-emerald-400" />
                                                                {trustScore}% Trust Score
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <span className="text-[10px] text-slate-400 uppercase block">QUOTED PRICE</span>
                                                    <span className="text-xl font-extrabold text-emerald-400">
                                                        ₹{Number(prop.quote_price).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Vehicle & Hotel Meta Row */}
                                            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                                                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2 text-slate-300">
                                                    <Car className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                    <span className="truncate">{prop.vehicle_model || 'AC Private Cab'}</span>
                                                </div>
                                                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center gap-2 text-slate-300">
                                                    <Hotel className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                    <span className="truncate">{prop.hotel_category || 'Verified Hotel'}</span>
                                                </div>
                                            </div>

                                            {/* Inclusions Checklist */}
                                            <div className="mb-4 space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                                                <span className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">
                                                    ✅ What's Included in This Package:
                                                </span>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
                                                    {Array.isArray(prop.inclusions) && prop.inclusions.map((inc, i) => (
                                                        <div key={i} className="flex items-start gap-1.5">
                                                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                                            <span className="text-slate-200">{inc}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Exclusions */}
                                                {Array.isArray(prop.exclusions) && prop.exclusions.length > 0 && (
                                                    <div className="pt-2 border-t border-slate-800/60 mt-2">
                                                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                                            ❌ Excluded:
                                                        </span>
                                                        <div className="flex flex-wrap gap-2 mt-1 text-[11px] text-slate-400">
                                                            {prop.exclusions.map((exc, i) => (
                                                                <span key={i} className="flex items-center gap-1">
                                                                    <X className="w-3 h-3 text-rose-400" />
                                                                    {exc}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Itinerary Summary */}
                                            {prop.itinerary_summary && (
                                                <div className="mb-4 text-xs text-slate-300 bg-slate-950/30 p-3 rounded-xl border border-slate-800/60">
                                                    <strong className="text-emerald-400 block mb-1">Itinerary Plan & Highlights:</strong>
                                                    <p className="whitespace-pre-line text-slate-400">{prop.itinerary_summary}</p>
                                                </div>
                                            )}

                                            {prop.vendor_message && (
                                                <div className="mb-4 text-xs text-slate-400 italic">
                                                    "{prop.vendor_message}"
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-800">
                                            <div className="flex items-center gap-2">
                                                {prop.chat ? (
                                                    <Link
                                                        href={route('trip-chats.show', prop.chat.id)}
                                                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                                                    >
                                                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                                                        <span>Chat & Negotiate</span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-slate-500">Chat Available</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {isAccepted ? (
                                                    <button
                                                        type="button"
                                                        disabled={isActionPending}
                                                        onClick={() => handleDismissProposal(prop.id, vendor?.business_name, true)}
                                                        className="px-4 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border border-rose-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                                                        title="Dismiss accepted vendor to re-open all proposals"
                                                    >
                                                        <X className="w-4 h-4 text-rose-400" />
                                                        <span>Dismiss / Change Vendor</span>
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            disabled={isActionPending}
                                                            onClick={() => handleDismissProposal(prop.id, vendor?.business_name, false)}
                                                            className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-300 font-semibold text-xs rounded-xl flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                                                            title="Dismiss this proposal"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                            <span>Dismiss</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={isActionPending}
                                                            onClick={() => handleAcceptProposal(prop.id, prop.quote_price, vendor?.business_name)}
                                                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            <span>{trip.status === 'booked' ? 'Switch to This Vendor' : 'Accept Proposal'}</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* SIDE-BY-SIDE PROPOSAL COMPARISON MODAL */}
            {compareModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                            <div>
                                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                                    <Columns3 className="w-5 h-5 text-emerald-400" />
                                    Side-by-Side Proposal Comparison Matrix
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Compare all submitted quotes across pricing, vehicle category, hotel stars, and included amenities.
                                </p>
                            </div>
                            <button
                                onClick={() => setCompareModalOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body / Matrix Grid */}
                        <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
                            <div className="min-w-[650px] grid grid-cols-3 sm:grid-cols-4 gap-4">
                                {/* Row Labels Column */}
                                <div className="space-y-6 pt-24 text-xs font-semibold text-slate-400">
                                    <div className="h-10 flex items-center text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                                        Total Package Quote
                                    </div>
                                    <div className="h-8 flex items-center text-slate-300">
                                        Assigned Vehicle
                                    </div>
                                    <div className="h-8 flex items-center text-slate-300">
                                        Hotel Category
                                    </div>
                                    <div className="h-8 flex items-center text-slate-300">
                                        Vendor Trust Score
                                    </div>
                                    <div className="min-h-28 flex items-start pt-2 text-slate-300">
                                        Included Amenities
                                    </div>
                                    <div className="h-10 flex items-center text-slate-300">
                                        Actions
                                    </div>
                                </div>

                                {/* Operator Columns */}
                                {trip.proposals.map(prop => {
                                    const vendor = prop.vendor;
                                    const isAccepted = prop.status === 'accepted';
                                    const isLowest = lowestPriceProposal && lowestPriceProposal.id === prop.id;
                                    const trustScore = Math.round((vendor?.trust_score || 0.85) * 100);

                                    return (
                                        <div 
                                            key={prop.id}
                                            className={`p-4 rounded-xl border flex flex-col space-y-6 text-xs transition-all ${
                                                isAccepted 
                                                    ? 'bg-emerald-950/20 border-emerald-500 ring-1 ring-emerald-500/30' 
                                                    : 'bg-slate-950/70 border-slate-800'
                                            }`}
                                        >
                                            {/* Column Header: Vendor */}
                                            <div className="h-20 flex flex-col justify-between border-b border-slate-800 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-emerald-400 text-xs shrink-0">
                                                        {vendor?.business_name?.substring(0, 2) || 'VN'}
                                                    </div>
                                                    <div className="truncate">
                                                        <h4 className="font-bold text-white text-xs truncate" title={vendor?.business_name}>
                                                            {vendor?.business_name}
                                                        </h4>
                                                        <span className="text-[10px] text-slate-400 block truncate">
                                                            {vendor?.district?.name || 'South India'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {isLowest && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 inline-block self-start mt-1">
                                                        ★ Best Price
                                                    </span>
                                                )}
                                            </div>

                                            {/* Price */}
                                            <div className="h-10 flex items-center">
                                                <span className="text-xl font-extrabold text-emerald-400">
                                                    ₹{Number(prop.quote_price).toLocaleString()}
                                                </span>
                                            </div>

                                            {/* Vehicle */}
                                            <div className="h-8 flex items-center text-slate-200">
                                                <Car className="w-3.5 h-3.5 text-emerald-400 inline mr-1.5 shrink-0" />
                                                <span className="truncate">{prop.vehicle_model || 'AC Cab'}</span>
                                            </div>

                                            {/* Hotel */}
                                            <div className="h-8 flex items-center text-slate-200">
                                                <Hotel className="w-3.5 h-3.5 text-amber-400 inline mr-1.5 shrink-0" />
                                                <span className="truncate">{prop.hotel_category || 'Verified Stay'}</span>
                                            </div>

                                            {/* Trust Score */}
                                            <div className="h-8 flex items-center">
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20 text-[11px] flex items-center gap-1">
                                                    <Award className="w-3 h-3 text-emerald-400" />
                                                    {trustScore}% Trust
                                                </span>
                                            </div>

                                            {/* Inclusions */}
                                            <div className="min-h-28 space-y-1 text-[11px] text-slate-300">
                                                {Array.isArray(prop.inclusions) && prop.inclusions.slice(0, 5).map((inc, i) => (
                                                    <div key={i} className="flex items-start gap-1">
                                                        <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                                                        <span className="truncate">{inc}</span>
                                                    </div>
                                                ))}
                                                {Array.isArray(prop.inclusions) && prop.inclusions.length > 5 && (
                                                    <span className="text-[10px] text-slate-500 block">
                                                        +{prop.inclusions.length - 5} more inclusions
                                                    </span>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="h-10 flex items-center gap-2 pt-2 border-t border-slate-800">
                                                {prop.chat && (
                                                    <Link
                                                        href={route('trip-chats.show', prop.chat.id)}
                                                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
                                                        title="Chat with vendor"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                    </Link>
                                                )}

                                                {isAccepted ? (
                                                    <button
                                                        type="button"
                                                        disabled={isActionPending}
                                                        onClick={() => {
                                                            setCompareModalOpen(false);
                                                            handleDismissProposal(prop.id, vendor?.business_name, true);
                                                        }}
                                                        className="flex-1 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs rounded-lg transition-all text-center cursor-pointer"
                                                    >
                                                        Dismiss Vendor
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled={isActionPending}
                                                        onClick={() => {
                                                            setCompareModalOpen(false);
                                                            handleAcceptProposal(prop.id, prop.quote_price, vendor?.business_name);
                                                        }}
                                                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-all text-center cursor-pointer"
                                                    >
                                                        {trip.status === 'booked' ? 'Switch' : 'Accept'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
