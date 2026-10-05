import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Compass, PlusCircle, Clock, CheckCircle2, XCircle, AlertCircle, 
    Calendar, Users, IndianRupee, MapPin, MessageSquare, ArrowRight, 
    ShieldCheck, Sparkles, Building2
} from 'lucide-react';

export default function CustomTripsIndex({ auth, trips = [] }) {
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending_verification':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" />
                        Admin Verification Pending
                    </span>
                );
            case 'verified_active':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Open for Vendor Quotes
                    </span>
                );
            case 'booked':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Proposal Accepted & Booked
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" />
                        Request Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                        {status}
                    </span>
                );
        }
    };

    const getRegionBadge = (region) => {
        if (region === 'kerala') return <span className="text-xs px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/20">🌴 Kerala Circuit</span>;
        if (region === 'inside_tn') return <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">🏛️ Tamil Nadu</span>;
        return <span className="text-xs px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/20">🗺️ Interstate South India</span>;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <Head title="My Custom Trips & Quotes | TN Explore" />

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

                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Compass className="w-4 h-4 text-slate-950" />
                            </div>
                            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent hidden sm:inline-block">
                                TN Explore <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-1">Custom Hub</span>
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link 
                            href={route('trip-chats.index')} 
                            className="text-xs sm:text-sm px-3 sm:px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 flex items-center gap-1.5 transition-all"
                        >
                            <MessageSquare className="w-4 h-4 text-emerald-400" />
                            <span className="hidden sm:inline">Messages /</span> Chat
                        </Link>
                        <Link 
                            href={route('custom-trips.create')} 
                            className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>New Trip</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            My Custom Trip Requests
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                                {trips.length} Total
                            </span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Track admin moderation, review bids from verified vendors, and chat to customize inclusions.
                        </p>
                    </div>

                    <Link 
                        href={route('custom-trips.create')} 
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Create New Trip Request
                    </Link>
                </div>

                {trips.length === 0 ? (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">No Custom Trips Requested Yet</h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Planning a family trip to Munnar, a friends trek to Nilgiris, or a solo group pool? Submit a request and let certified vendors create tailored quotes for you.
                        </p>
                        <Link 
                            href={route('custom-trips.create')} 
                            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl inline-flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Create Your First Request
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {trips.map(trip => (
                            <div 
                                key={trip.id} 
                                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 transition-all flex flex-col justify-between shadow-xl"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {getRegionBadge(trip.destination_region)}
                                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                                    User ID: #{trip.user_id || auth?.user?.id}
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                                    Trip #{trip.id}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg text-white group-hover:text-emerald-400">
                                                {trip.title}
                                            </h3>
                                        </div>
                                        {getStatusBadge(trip.status)}
                                    </div>

                                    {/* Destination Spots */}
                                    <div className="flex items-center gap-1.5 text-xs text-slate-300 mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                                        <span className="truncate">
                                            {Array.isArray(trip.destinations) ? trip.destinations.join(' • ') : trip.destinations}
                                        </span>
                                    </div>

                                    {/* Trip Meta Grid */}
                                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 mb-4">
                                        <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                                            <span className="block text-slate-500 text-[10px]">DURATION</span>
                                            <span className="font-bold text-slate-200">{trip.duration_days} Days</span>
                                        </div>
                                        <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                                            <span className="block text-slate-500 text-[10px]">TRAVELERS</span>
                                            <span className="font-bold text-slate-200">{trip.adults_count} Adults {trip.children_count > 0 ? `+ ${trip.children_count} Kids` : ''}</span>
                                        </div>
                                        <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
                                            <span className="block text-slate-500 text-[10px]">BUDGET</span>
                                            <span className="font-bold text-emerald-400">₹{Number(trip.budget_min).toLocaleString()} - ₹{Number(trip.budget_max).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Proposals Banner */}
                                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-emerald-400" />
                                            <span className="text-xs font-semibold text-slate-200">
                                                {trip.proposals_count} Vendor Proposals Received
                                            </span>
                                        </div>
                                        {trip.proposals_count > 0 && (
                                            <span className="text-[11px] font-bold text-emerald-400">
                                                Review & Compare →
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                    <span className="text-xs text-slate-500">
                                        Requested on {new Date(trip.created_at).toLocaleDateString()}
                                    </span>
                                    <Link 
                                        href={route('custom-trips.show', trip.id)}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                                    >
                                        View Details & Bids
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
