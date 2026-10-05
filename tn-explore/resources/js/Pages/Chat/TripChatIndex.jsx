import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
    Compass, MessageSquare, ArrowRight, Clock, ShieldCheck, 
    Building2, User, MapPin, Sparkles, ArrowLeft, MessagesSquare
} from 'lucide-react';

export default function TripChatIndex({ auth, chats = [], isVendor }) {
    return (
        <div className="min-h-screen bg-[#FFFDF7] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans">
            <Head title="Live Trip Chats | TN Explore" />

            {/* Header */}
            <header className="border-b border-[#E6D5B8] dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl sticky top-0 z-40 shadow-xs">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link 
                            href={isVendor ? route('vendor.dashboard') : route('custom-trips.index')}
                            className="p-2 rounded-xl bg-[#FAF7F0] dark:bg-stone-800 hover:bg-[#E6D5B8]/60 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors border border-[#E6D5B8] dark:border-stone-700 cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <span className="font-bold text-base text-stone-900 dark:text-stone-100 font-serif">
                            Live Custom Trip Conversations
                        </span>
                    </div>

                    <Link 
                        href={isVendor ? route('vendor.opportunities.index') : route('custom-trips.create')} 
                        className="text-xs px-4 py-2 rounded-xl bg-maroon-800 hover:bg-maroon-900 text-white font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                    >
                        {isVendor ? 'Browse Leads' : '+ New Custom Trip'}
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-maroon-800 dark:text-amber-400 bg-maroon-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-maroon-200 dark:border-amber-800/50 flex items-center gap-1.5">
                                <MessagesSquare className="w-3.5 h-3.5 text-maroon-700 dark:text-amber-400" />
                                Direct Negotiations
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight font-serif flex items-center gap-2.5">
                            Trip Conversations & Negotiations
                            <span className="text-xs px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800/50 font-sans">
                                {chats.length} Channels
                            </span>
                        </h1>
                        <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                            Direct messaging between verified tour operators and tourists to finalize itineraries, revise quotes, and confirm bookings.
                        </p>
                    </div>
                </div>

                {chats.length === 0 ? (
                    <div className="bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-800 rounded-3xl p-10 sm:p-12 text-center max-w-md mx-auto shadow-sm space-y-4">
                        <div className="w-16 h-16 mx-auto bg-[#FAF7F0] dark:bg-stone-800 border border-[#E6D5B8] dark:border-stone-700 rounded-2xl flex items-center justify-center text-maroon-800 dark:text-amber-400">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">No Active Chat Streams</h3>
                            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                                Chats are created automatically when a vendor submits a quotation for a verified custom trip request.
                            </p>
                        </div>
                        <div className="pt-2">
                            <Link 
                                href={isVendor ? route('vendor.opportunities.index') : route('custom-trips.create')}
                                className="px-5 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                            >
                                {isVendor ? 'View Open Leads' : 'Create Custom Request'}
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {chats.map(chat => {
                            const partnerName = isVendor 
                                ? (chat.tourist?.name || 'Tourist User')
                                : (chat.vendor?.business_name || 'Tour Vendor');
                            const lastMsg = chat.messages && chat.messages.length > 0 ? chat.messages[0] : null;

                            return (
                                <Link
                                    key={chat.id}
                                    href={route('trip-chats.show', chat.id)}
                                    className="bg-white dark:bg-stone-900 hover:bg-amber-50/40 dark:hover:bg-stone-800/60 border border-[#E6D5B8] dark:border-stone-800 hover:border-amber-300 dark:hover:border-stone-700 rounded-3xl p-5 sm:p-6 transition-all flex items-center justify-between gap-4 block shadow-sm group"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] dark:bg-stone-800 border border-[#E6D5B8] dark:border-stone-700 flex items-center justify-center font-bold text-maroon-800 dark:text-amber-400 text-lg shrink-0 group-hover:scale-105 transition-transform">
                                            {isVendor ? <User className="w-6 h-6 text-stone-600 dark:text-stone-300" /> : <Building2 className="w-6 h-6 text-maroon-800 dark:text-amber-400" />}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 truncate group-hover:text-maroon-800 dark:group-hover:text-amber-400 transition-colors">
                                                    {partnerName}
                                                </h3>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                                                    User ID: #{chat.tourist_id}
                                                </span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                                                    Trip: {chat.custom_trip?.title || `#${chat.custom_trip_id}`}
                                                </span>
                                            </div>

                                            <p className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-md">
                                                {lastMsg ? lastMsg.message : 'Chat initiated. Click to view quotation details.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        {chat.proposal && (
                                            <div className="text-right hidden sm:block">
                                                <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase block font-semibold">QUOTED</span>
                                                <span className="text-base font-bold text-maroon-800 dark:text-emerald-400 font-mono">
                                                    ₹{Number(chat.proposal.quote_price).toLocaleString()}
                                                </span>
                                            </div>
                                        )}

                                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-maroon-800 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

