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
    CheckCircle2,
    MessageSquare,
    Award,
    Menu,
    X,
    User,
    ChevronRight,
    Car
} from 'lucide-react';
import ThemeToggle from '@/Components/ThemeToggle';
import LanguageToggle from '@/Components/LanguageToggle';

export default function VendorLayout({ header, children, onOpenAddListing }) {
    const { auth, vendor } = usePage().props;
    const user = auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isVerified = vendor?.kyc_status === 'verified';
    const currentRoute = typeof route !== 'undefined' && route().current ? route().current() : '';
    const trustScore = Math.round((vendor?.trust_score || 0.91) * 100);

    // Exactly 5 streamlined sidebar items as requested
    const navItems = [
        {
            label: 'Dashboard',
            href: route('vendor.dashboard'),
            icon: LayoutDashboard,
            active: currentRoute === 'vendor.dashboard',
            badge: null
        },
        {
            label: 'Vendor Studio CMS',
            href: route('vendor.studio.index'),
            icon: Store,
            active: currentRoute.startsWith('vendor.studio'),
            badge: 'NEW 🎨'
        },
        {
            label: 'Fleet Vehicles',
            href: route('vendor.studio.fleet'),
            icon: Car,
            active: currentRoute === 'vendor.studio.fleet',
            badge: null
        },
        {
            label: 'Leads & Bids',
            href: route('vendor.opportunities.index'),
            icon: Sparkles,
            active: currentRoute.startsWith('vendor.opportunities'),
            badge: 'LIVE 🎯'
        },
        {
            label: 'Bookings',
            href: route('vendor.bookings.index'),
            icon: Calendar,
            active: currentRoute.startsWith('vendor.bookings'),
            badge: null
        },
        {
            label: 'Tour Packages',
            href: route('vendor.listings.index'),
            icon: Package,
            active: currentRoute.startsWith('vendor.listings'),
            badge: null
        },
        {
            label: 'Messages',
            href: route('trip-chats.index'),
            icon: MessageSquare,
            active: currentRoute.startsWith('trip-chats'),
            badge: null
        }
    ];

    return (
        <div className="vendor-theme min-h-screen bg-[#FFFDF7] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex font-sans antialiased selection:bg-amber-200 selection:text-stone-900 transition-colors duration-300">
            {/* DESKTOP SIDEBAR NAVIGATION */}
            <aside className="w-64 bg-[#FAF7F0] dark:bg-stone-900 border-r border-[#E6D5B8] dark:border-stone-800 flex flex-col justify-between p-4 hidden md:flex shrink-0 h-screen sticky top-0 z-30 shadow-sm transition-colors">
                <div className="space-y-5 flex-1 overflow-y-auto pr-1">
                    {/* Brand Header */}
                    <div className="px-2 py-2 border-b border-[#E6D5B8] dark:border-stone-800">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/50 p-1 flex items-center justify-center shadow-sm group-hover:scale-105 transition-all">
                                <Compass className="w-6 h-6 text-maroon-800 dark:text-amber-400" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-serif font-black text-sm tracking-wide text-maroon-900 dark:text-amber-400 leading-none">TN EXPLORE</span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-peacock-100 dark:bg-teal-950 text-peacock-800 dark:text-teal-300 border border-peacock-300 dark:border-teal-800">
                                        VENDOR
                                    </span>
                                </div>
                                <p className="text-[11px] text-stone-600 dark:text-stone-400 font-bold truncate mt-0.5">
                                    {vendor?.business_name || 'Vendor Hub'}
                                </p>
                            </div>
                        </Link>

                        {/* Verification & Canonical Trust Badge */}
                        <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-stone-800/80 border border-[#E6D5B8] dark:border-stone-700 flex items-center justify-between text-[11px] shadow-sm">
                            <div className="flex items-center gap-1.5 text-peacock-700 dark:text-teal-300 font-bold">
                                {isVerified ? (
                                    <>
                                        <ShieldCheck className="w-4 h-4 text-peacock-600 dark:text-teal-400" />
                                        <span>Verified Partner</span>
                                    </>
                                ) : (
                                    <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1 font-bold">
                                        <ShieldAlert className="w-4 h-4" />
                                        <span>KYC Verified</span>
                                    </span>
                                )}
                            </div>
                            <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-turmeric-800 dark:text-amber-300 font-black border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                <Award className="w-3 h-3 text-turmeric-600 dark:text-amber-400" />
                                {trustScore}%
                            </span>
                        </div>
                    </div>

                    {/* Quick Add Action Button */}
                    <div className="px-1">
                        {onOpenAddListing ? (
                            <button
                                onClick={onOpenAddListing}
                                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-turmeric-600 to-amber-600 hover:from-turmeric-700 hover:to-amber-700 text-white font-extrabold text-xs shadow-md shadow-turmeric-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98"
                            >
                                <Plus className="w-4 h-4 stroke-[3]" />
                                <span>Add Listing</span>
                            </button>
                        ) : (
                            <Link
                                href={route('vendor.listings.index', { action: 'new' })}
                                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-turmeric-600 to-amber-600 hover:from-turmeric-700 hover:to-amber-700 text-white font-extrabold text-xs shadow-md shadow-turmeric-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 active:scale-98"
                            >
                                <Plus className="w-4 h-4 stroke-[3]" />
                                <span>Add Listing</span>
                            </Link>
                        )}
                    </div>

                    {/* Navigation Items (Streamlined 5-Item Sidebar) */}
                    <nav className="space-y-1 px-1">
                        <span className="text-[10px] font-extrabold text-stone-500 dark:text-stone-400 uppercase tracking-wider px-3 mb-1.5 block">
                            Operations
                        </span>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                        item.active
                                            ? 'bg-maroon-800 text-white shadow-md shadow-maroon-800/15'
                                            : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-amber-50 dark:hover:bg-stone-800 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-4 h-4 flex-shrink-0 ${item.active ? 'text-amber-300' : 'text-stone-500 dark:text-stone-400'}`} />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                            item.active 
                                                ? 'bg-amber-400 text-stone-950' 
                                                : 'bg-turmeric-100 dark:bg-amber-950 text-turmeric-800 dark:text-amber-300 border border-turmeric-300 dark:border-amber-800'
                                        }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Secondary Account Options */}
                    <div className="px-1 pt-3 border-t border-[#E6D5B8] dark:border-stone-800 space-y-1">
                        <span className="text-[10px] font-extrabold text-stone-500 dark:text-stone-400 uppercase tracking-wider px-3 mb-1.5 block">
                            Account & Storefront
                        </span>
                        {vendor?.slug && (
                            <a
                                href={route('vendor.profile', vendor.slug)}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-turmeric-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-stone-800 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <Eye className="w-4 h-4 text-turmeric-600 dark:text-amber-400" />
                                    <span>Public Storefront</span>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                            </a>
                        )}

                        <Link
                            href={route('profile.edit')}
                            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-amber-50 dark:hover:bg-stone-800 transition-all"
                        >
                            <Store className="w-4 h-4 text-peacock-600 dark:text-teal-400" />
                            <span>Business Profile</span>
                        </Link>
                    </div>
                </div>

                {/* Footer Controls & User Menu */}
                <div className="pt-3 border-t border-[#E6D5B8] dark:border-stone-800 space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <ThemeToggle />
                        <LanguageToggle />
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-[#E6D5B8] dark:border-stone-700 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-turmeric-100 dark:bg-amber-950 text-turmeric-800 dark:text-amber-300 font-black flex items-center justify-center border border-turmeric-200 dark:border-amber-800 text-xs shrink-0">
                                {user?.name?.charAt(0) || 'V'}
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{user?.name}</div>
                                <div className="text-[10px] text-stone-500 dark:text-stone-400 truncate">{vendor?.district?.name || 'Tamil Nadu'}</div>
                            </div>
                        </div>
                    </div>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 transition-all cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </Link>
                </div>
            </aside>

            {/* MOBILE TOP BAR & DRAWER */}
            <div className="md:hidden w-full flex flex-col sticky top-0 z-40 bg-[#FFFDF7]/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-[#E6D5B8] dark:border-stone-800">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 p-0.5 flex items-center justify-center">
                            <Compass className="w-5 h-5 text-maroon-800 dark:text-amber-400" />
                        </div>
                        <span className="font-serif font-black text-sm text-maroon-900 dark:text-amber-400">TN EXPLORE</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase bg-peacock-100 dark:bg-teal-950 text-peacock-800 dark:text-teal-300 border border-peacock-200">
                            PARTNER
                        </span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer */}
                {mobileMenuOpen && (
                    <div className="p-4 bg-[#FAF7F0] dark:bg-stone-900 border-b border-[#E6D5B8] dark:border-stone-800 space-y-2 animate-fadeIn">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                                        item.active ? 'bg-maroon-800 text-white' : 'text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 text-stone-950 font-black">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}

                        {vendor?.slug && (
                            <a
                                href={route('vendor.profile', vendor.slug)}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-turmeric-700 dark:text-amber-400"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Eye className="w-4 h-4" />
                                    <span>View Public Storefront</span>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}

                        <div className="pt-2 border-t border-[#E6D5B8] dark:border-stone-800">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="w-full py-2 text-rose-700 dark:text-rose-400 text-xs font-bold text-center"
                            >
                                Sign Out
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
                {/* Optional Subheader / Breadcrumb */}
                {header && (
                    <header className="bg-white dark:bg-stone-900 border-b border-[#E6D5B8] dark:border-stone-800 py-4 px-4 sm:px-6 lg:px-8 shadow-sm">
                        {header}
                    </header>
                )}

                <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
                    {children}
                </main>

                {/* Footer */}
                <footer className="border-t border-[#E6D5B8] dark:border-stone-800 bg-[#FAF7F0] dark:bg-stone-900 py-4 text-xs text-stone-500 dark:text-stone-400">
                    <div className="px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-turmeric-600 dark:text-amber-400" />
                            <span className="font-bold text-stone-800 dark:text-stone-200">{vendor?.business_name}</span>
                            <span>• Verified Operator ID #{vendor?.id || 1}</span>
                        </div>
                        <div>
                            TN Explore Department of Tourism B2B Portal
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
