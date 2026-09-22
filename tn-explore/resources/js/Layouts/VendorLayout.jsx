import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Store,
    LayoutDashboard,
    Package,
    Calendar,
    Eye,
    Plus,
    Bell,
    ShieldCheck,
    ShieldAlert,
    LogOut,
    ChevronDown,
    MapPin,
    ExternalLink,
    Compass,
    Sparkles,
    CheckCircle2
} from 'lucide-react';

export default function VendorLayout({ header, children, onOpenAddListing }) {
    const { auth, vendor } = usePage().props;
    const user = auth?.user;
    const [showingUserDropdown, setShowingUserDropdown] = useState(false);
    const [showingNotifications, setShowNotifications] = useState(false);

    const isVerified = vendor?.kyc_status === 'verified' || vendor?.status === 'active';
    const currentRoute = typeof route !== 'undefined' && route().current ? route().current() : '';

    return (
        <div className="min-h-screen bg-[#070B14] text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
            {/* TOP NAVIGATION BAR */}
            <nav className="sticky top-0 z-40 bg-[#0B1120]/95 backdrop-blur-md border-b border-white/10 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        
                        {/* Left: Brand Logo & Title */}
                        <div className="flex items-center gap-6">
                            <Link href="/" className="flex items-center gap-2.5 group">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all">
                                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                                        <Compass className="w-5 h-5 text-emerald-400" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-display font-black text-sm tracking-wider text-white">TN EXPLORE</span>
                                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            PARTNER
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-medium truncate max-w-[180px] sm:max-w-xs">
                                        {vendor?.business_name || 'Vendor Workspace'}
                                    </p>
                                </div>
                            </Link>

                            {/* Nav Links (Desktop) */}
                            <div className="hidden md:flex items-center gap-1">
                                <Link
                                    href={route('vendor.dashboard')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        currentRoute === 'vendor.dashboard'
                                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <LayoutDashboard className="w-3.5 h-3.5" />
                                    <span>Dashboard</span>
                                </Link>

                                <Link
                                    href={route('vendor.listings.index')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        currentRoute.startsWith('vendor.listings')
                                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Package className="w-3.5 h-3.5" />
                                    <span>Listings & Fleet</span>
                                </Link>

                                <Link
                                    href={route('vendor.bookings.index')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        currentRoute.startsWith('vendor.bookings')
                                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Bookings Pipeline</span>
                                </Link>
                            </div>
                        </div>

                        {/* Right: Actions, Public Storefront, User Menu */}
                        <div className="flex items-center gap-2.5">
                            
                            {/* Quick Add Listing */}
                            {onOpenAddListing ? (
                                <button
                                    onClick={onOpenAddListing}
                                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Add Service / Package</span>
                                    <span className="sm:hidden">Add</span>
                                </button>
                            ) : (
                                <Link
                                    href={route('vendor.listings.index', { action: 'new' })}
                                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Add Service / Package</span>
                                    <span className="sm:hidden">Add</span>
                                </Link>
                            )}

                            {/* View Public Storefront */}
                            {vendor?.slug && (
                                <a
                                    href={route('vendor.profile', vendor.slug)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hidden lg:flex px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold border border-white/10 items-center gap-1.5 transition-all"
                                >
                                    <Eye className="w-3.5 h-3.5 text-gold" />
                                    <span>View Public Storefront</span>
                                    <ExternalLink className="w-3 h-3 text-gray-400" />
                                </a>
                            )}

                            {/* User Profile / Business Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowingUserDropdown(!showingUserDropdown)}
                                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-medium text-white transition-all cursor-pointer"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30">
                                        {user?.name?.charAt(0) || 'V'}
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <div className="text-xs font-bold text-white truncate max-w-[120px]">
                                            {user?.name}
                                        </div>
                                        <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                                            {isVerified ? (
                                                <span className="flex items-center gap-0.5">
                                                    <ShieldCheck className="w-2.5 h-2.5" /> Verified
                                                </span>
                                            ) : (
                                                <span className="text-amber-400 flex items-center gap-0.5">
                                                    <ShieldAlert className="w-2.5 h-2.5" /> KYC Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                </button>

                                {/* Dropdown Menu */}
                                {showingUserDropdown && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowingUserDropdown(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0E1526] border border-white/10 shadow-2xl z-50 p-2 text-xs space-y-1 animate-fadeIn">
                                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 mb-2">
                                                <div className="font-bold text-white text-sm truncate">{vendor?.business_name}</div>
                                                <div className="text-gray-400 text-[11px] truncate">{user?.email}</div>
                                                <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                                                    <span className="text-gray-400">District:</span>
                                                    <span className="font-semibold text-gold">{vendor?.district?.name || 'Tamil Nadu'}</span>
                                                </div>
                                            </div>

                                            {vendor?.slug && (
                                                <a
                                                    href={route('vendor.profile', vendor.slug)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center justify-between px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <Eye className="w-4 h-4 text-gold" />
                                                        <span>Public Storefront</span>
                                                    </span>
                                                    <ExternalLink className="w-3 h-3 text-gray-500" />
                                                </a>
                                            )}

                                            <Link
                                                href={route('profile.edit')}
                                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition"
                                            >
                                                <Store className="w-4 h-4 text-emerald-400" />
                                                <span>Account Profile</span>
                                            </Link>

                                            <div className="border-t border-white/10 my-1" />

                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition cursor-pointer text-left font-semibold"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Sign Out</span>
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Submenu Navigation */}
                <div className="md:hidden border-t border-white/5 px-4 py-2 flex items-center justify-around bg-slate-950/60">
                    <Link
                        href={route('vendor.dashboard')}
                        className={`text-xs font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 ${
                            currentRoute === 'vendor.dashboard' ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-400'
                        }`}
                    >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        href={route('vendor.listings.index')}
                        className={`text-xs font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 ${
                            currentRoute.startsWith('vendor.listings') ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-400'
                        }`}
                    >
                        <Package className="w-3.5 h-3.5" />
                        <span>Listings</span>
                    </Link>
                    <Link
                        href={route('vendor.bookings.index')}
                        className={`text-xs font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 ${
                            currentRoute.startsWith('vendor.bookings') ? 'bg-emerald-500/20 text-emerald-300' : 'text-gray-400'
                        }`}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Bookings</span>
                    </Link>
                </div>
            </nav>

            {/* OPTIONAL SUBHEADER */}
            {header && (
                <header className="bg-[#0B1120] border-b border-white/10 shadow-sm">
                    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* MAIN CONTENT CANVAS */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                {children}
            </main>

            {/* FOOTER */}
            <footer className="border-t border-white/10 bg-[#0B1120] py-4 text-center text-xs text-gray-500">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold text-gray-300">{vendor?.business_name}</span>
                        <span>• Commercial Partner ID #{vendor?.id || 1}</span>
                    </div>
                    <div>
                        TN Explore Department of Tourism B2B Portal
                    </div>
                </div>
            </footer>
        </div>
    );
}
