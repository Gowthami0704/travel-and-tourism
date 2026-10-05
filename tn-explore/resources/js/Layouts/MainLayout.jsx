import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import SmartCursor from '@/Components/Themes/SmartCursor';
import TnMitraChatBubble from '@/Components/Ai/TnMitraChatBubble';
import NotificationBanner, { NotificationBellDropdown } from '@/Components/NotificationBanner';
import LanguageToggle from '@/Components/LanguageToggle';
import ThemeToggle from '@/Components/ThemeToggle';
import { useLanguage } from '@/Contexts/LanguageContext';
import { 
    Compass, 
    Sparkles, 
    MapPin, 
    ChevronDown, 
    Calendar, 
    Users, 
    Map, 
    Handshake, 
    Shield, 
    Store, 
    Menu, 
    X, 
    LogOut, 
    Heart, 
    User,
    ArrowRight
} from 'lucide-react';

export default function MainLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const { t } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [planDropdownOpen, setPlanDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setPlanDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="tourist-theme min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col font-sans antialiased transition-colors duration-200">
            {/* Custom Interactive Smart Cursor */}
            <SmartCursor />

            {/* Top Notification Bar */}
            <NotificationBanner />

            {/* Vendor notice when browsing tourist pages */}
            {user?.role === 'vendor' && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs px-4 py-2 text-center flex items-center justify-center gap-2">
                    <Store className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                        You are browsing as registered partner <strong>{user?.name}</strong>.
                    </span>
                    <Link
                        href={route('vendor.studio.index')}
                        className="font-bold underline hover:text-amber-900 dark:hover:text-amber-100 ml-1"
                    >
                        Open Vendor Studio →
                    </Link>
                </div>
            )}

            {/* Top Navigation Bar: 6 Clean Items */}
            <header className="sticky top-0 z-40 bg-[var(--card)] dark:bg-[var(--card)] border-b border-[var(--border)] shadow-xs transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* 1. Brand Logo: 'TN Explore' Only (Tagline removed) */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center gap-2.5 group">
                                <div className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white dark:text-[#14110F] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-180">
                                    <Compass className="w-5 h-5" strokeWidth={1.5} />
                                </div>
                                <span className="font-serif font-black text-xl tracking-tight text-[var(--text)]">
                                    TN Explore
                                </span>
                            </Link>
                        </div>

                        {/* 2. Center Nav: Districts · Plan a Trip (dropdown) · TN Mitra AI · Partner With Us */}
                        <nav className="hidden lg:flex items-center gap-1 font-medium text-sm text-[var(--muted)]">
                            {/* Districts */}
                            <Link
                                href="/"
                                className="px-3.5 py-2 rounded-lg hover:text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
                            >
                                Districts
                            </Link>

                            {/* Plan a Trip (Dropdown) */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setPlanDropdownOpen(!planDropdownOpen)}
                                    className={`px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                                        planDropdownOpen 
                                            ? 'text-[var(--text)] bg-stone-100 dark:bg-stone-800/60' 
                                            : 'hover:text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800/60'
                                    }`}
                                    aria-expanded={planDropdownOpen}
                                >
                                    <span>Plan a Trip</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-180 ${planDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                                </button>

                                {planDropdownOpen && (
                                    <div className="absolute left-0 mt-2 w-56 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                        <Link
                                            href="/trip-builder"
                                            onClick={() => setPlanDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
                                        >
                                            <Calendar className="w-4 h-4 text-[var(--primary)]" strokeWidth={1.5} />
                                            <div>
                                                <div className="font-bold">Trip Builder</div>
                                                <div className="text-[11px] text-[var(--muted)] font-normal">Day-by-day smart itineraries</div>
                                            </div>
                                        </Link>

                                        <Link
                                            href={route('custom-trips.create')}
                                            onClick={() => setPlanDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
                                        >
                                            <Map className="w-4 h-4 text-[var(--primary)]" strokeWidth={1.5} />
                                            <div>
                                                <div className="font-bold">Custom Trips</div>
                                                <div className="text-[11px] text-[var(--muted)] font-normal">Request tailored packages</div>
                                            </div>
                                        </Link>

                                        <Link
                                            href="/trip-mates"
                                            onClick={() => setPlanDropdownOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
                                        >
                                            <Users className="w-4 h-4 text-[var(--primary)]" strokeWidth={1.5} />
                                            <div>
                                                <div className="font-bold">Trip Mates</div>
                                                <div className="text-[11px] text-[var(--muted)] font-normal">Find travel companions</div>
                                            </div>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* TN Mitra AI */}
                            <Link
                                href="/ai-guide"
                                className="px-3.5 py-2 rounded-lg hover:text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors flex items-center gap-1.5"
                            >
                                <Sparkles className="w-4 h-4 text-[var(--highlight)]" strokeWidth={1.5} />
                                <span>TN Mitra AI</span>
                            </Link>

                            {/* Partner With Us */}
                            <Link
                                href={route('vendor.register')}
                                className="px-3.5 py-2 rounded-lg hover:text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors flex items-center gap-1.5"
                            >
                                <Handshake className="w-4 h-4 text-[var(--verified)]" strokeWidth={1.5} />
                                <span>Partner With Us</span>
                            </Link>
                        </nav>

                        {/* 3. Right: Language, Compact Theme, Notifications (signed in), Sign In / Get Started */}
                        <div className="hidden lg:flex items-center gap-2.5">
                            <LanguageToggle />
                            <ThemeToggle />

                            {user ? (
                                <div className="flex items-center gap-2 ml-1">
                                    <NotificationBellDropdown />

                                    {user.role === 'admin' ? (
                                        <Link
                                            href={route('admin.dashboard')}
                                            className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-[var(--text)] font-semibold text-xs flex items-center gap-1.5 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                                        >
                                            <Shield className="w-3.5 h-3.5 text-[var(--primary)]" strokeWidth={1.5} />
                                            Admin
                                        </Link>
                                    ) : user.role === 'vendor' ? (
                                        <Link
                                            href={route('vendor.dashboard')}
                                            className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-[var(--text)] font-semibold text-xs flex items-center gap-1.5 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                                        >
                                            <Store className="w-3.5 h-3.5 text-[var(--verified)]" strokeWidth={1.5} />
                                            Vendor
                                        </Link>
                                    ) : null}

                                    <Link
                                        href={route('dashboard')}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-[var(--text)] transition-colors"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-[var(--primary)] text-white dark:text-[#14110F] flex items-center justify-center font-bold text-[10px]">
                                            {user.name.charAt(0)}
                                        </div>
                                        <span>{user.name.split(' ')[0]}</span>
                                    </Link>

                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="p-2 rounded-lg text-[var(--muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                                        title="Log Out"
                                    >
                                        <LogOut className="w-4 h-4" strokeWidth={1.5} />
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 ml-1">
                                    <Link
                                        href={route('login')}
                                        className="px-3.5 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:opacity-95 text-white dark:text-[#14110F] font-bold text-xs shadow-sm transition-all"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Header Controls */}
                        <div className="lg:hidden flex items-center gap-2 shrink-0">
                            <LanguageToggle className="px-2.5 py-1 text-[11px]" />
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-xl border border-[var(--border)] text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                                aria-label="Toggle navigation menu"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Menu className="w-5 h-5" strokeWidth={1.5} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Panel */}
                {mobileMenuOpen && (
                    <div className="lg:hidden px-4 pt-3 pb-6 bg-[var(--card)] border-b border-[var(--border)] space-y-3 animate-in slide-in-from-top-4 duration-200">
                        {/* Theme and Language Controls Bar inside Mobile Drawer */}
                        <div className="flex items-center justify-between p-2 rounded-2xl bg-[var(--bg)] border border-[var(--border)] mb-2">
                            <span className="text-xs font-bold text-[var(--muted)] px-2">Theme Mode</span>
                            <ThemeToggle showLabels />
                        </div>

                        <div className="space-y-1">
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800"
                            >
                                🏛️ Explore All 38 Districts
                            </Link>
                            <Link
                                href="/trip-builder"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800"
                            >
                                🗓️ Day-by-Day Trip Builder
                            </Link>
                            <Link
                                href={route('custom-trips.create')}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800"
                            >
                                ✨ Custom Trip Requests & Quotes
                            </Link>
                            <Link
                                href="/trip-mates"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800"
                            >
                                👥 Trip Mates & Shared Travel
                            </Link>
                            <Link
                                href="/ai-guide"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800"
                            >
                                🤖 TN Mitra AI Travel Assistant
                            </Link>
                            <Link
                                href={route('vendor.register')}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800"
                            >
                                🤝 Partner With Us (Vendor Registration)
                            </Link>
                        </div>

                        <div className="pt-3 border-t border-[var(--border)] flex flex-col gap-2">
                            {user ? (
                                <>
                                    <Link
                                        href={route('dashboard')}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white dark:text-[#14110F] text-sm font-bold text-center shadow-sm"
                                    >
                                        My Dashboard ({user.name})
                                    </Link>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full px-4 py-2 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold text-center hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                                    >
                                        Log Out
                                    </Link>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        href={route('login')}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text)] text-xs font-bold text-center hover:bg-stone-100 dark:hover:bg-stone-800"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white dark:text-[#14110F] text-xs font-bold text-center"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Page Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="bg-[var(--card)] border-t border-[var(--border)] pt-12 pb-8 text-[var(--muted)] text-xs transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-[var(--primary)] text-white dark:text-[#14110F] flex items-center justify-center font-bold">
                                    <Compass className="w-4 h-4" strokeWidth={1.5} />
                                </div>
                                <span className="font-serif font-black text-base text-[var(--text)]">TN Explore</span>
                            </div>
                            <p className="leading-relaxed text-[var(--muted)]">
                                Tamil Nadu Smart Tourism Marketplace. Connecting travelers with authentic living heritage, temple architecture, misty hill stations, and certified local tour operators.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[var(--text)] uppercase tracking-wider mb-3">Districts by Region</h4>
                            <ul className="space-y-1.5">
                                <li>• South (Madurai, Tirunelveli, Kanyakumari, Rameswaram)</li>
                                <li>• Western Ghats (Nilgiris, Coimbatore, Valparai)</li>
                                <li>• Chola Heartlands (Thanjavur, Tiruchirappalli, Kumbakonam)</li>
                                <li>• Coastal Circuit (Mamallapuram, Nagapattinam, Cuddalore)</li>
                                <li>• North (Chennai, Kanchipuram, Vellore)</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[var(--text)] uppercase tracking-wider mb-3">Community & Roles</h4>
                            <ul className="space-y-1.5">
                                <li>• <strong>Tourists:</strong> Plan custom itineraries, meet trip mates</li>
                                <li>
                                    • <Link href={route('vendor.register')} className="text-[var(--primary)] hover:underline font-semibold">
                                        Partner With Us (Vendor Registration)
                                    </Link>
                                </li>
                                <li>
                                    • <Link href={route('vendor.login')} className="hover:underline font-medium">
                                        Vendor Portal Sign In
                                    </Link>
                                </li>
                                <li>
                                    • <Link href={route('admin.login')} className="text-amber-500 hover:underline font-semibold">
                                        Admin Control Center Sign In
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[var(--text)] uppercase tracking-wider mb-3">Safety & Governance</h4>
                            <ul className="space-y-1.5">
                                <li>• Multi-Factor Vendor KYC Document Verification</li>
                                <li>• Isolation Forest ML Anomaly & Fraud Screening</li>
                                <li>• Verified Tourist Feedback & Aspect Ratings</li>
                                <li>• Direct In-App Negotiation & Transparent Quotes</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                        <p>© {new Date().getFullYear()} TN Explore. Department of Tourism, Government of Tamil Nadu.</p>
                        <p className="flex items-center gap-1 justify-center">
                            Crafted with <Heart className="w-3.5 h-3.5 text-[var(--primary)] fill-[var(--primary)]" strokeWidth={1.5} /> for Tamil Nadu Tourism
                        </p>
                    </div>
                </div>
            </footer>

            {/* Floating TN Mitra AI Travel Companion Chat Bubble */}
            <TnMitraChatBubble />
        </div>
    );
}
