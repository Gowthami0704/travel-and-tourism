import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import NotificationBanner, { NotificationBellDropdown } from '@/Components/NotificationBanner';
import ThemeToggle from '@/Components/ThemeToggle';
import LanguageToggle from '@/Components/LanguageToggle';
import {
    Compass,
    LayoutDashboard,
    Calendar,
    Sparkles,
    Users,
    ChevronDown,
    Menu,
    X,
    LogOut,
    Shield,
    Store,
    Map
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const isVendor = user?.role === 'vendor';

    const navItems = [
        { label: 'Explore Tamil Nadu', href: route('home'), icon: Compass },
        { label: 'Plan a Trip', href: route('custom-trips.create'), icon: Calendar },
        { label: 'Trip Mates', href: route('trip-mates'), icon: Users },
        { label: 'TN Mitra AI', href: route('ai-guide'), icon: Sparkles },
        { label: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col font-sans antialiased transition-colors duration-200">
            {/* Single-fire Toast Notifications */}
            <NotificationBanner />

            {/* Vendor Portal Notice if logged in as vendor */}
            {isVendor && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs px-4 py-2 text-center flex items-center justify-center gap-2">
                    <Store className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                        You are signed in as registered partner <strong>{user?.name}</strong>.
                    </span>
                    <Link
                        href={route('vendor.studio.index')}
                        className="font-bold underline hover:text-amber-900 dark:hover:text-amber-100 ml-1"
                    >
                        Go to Vendor Studio →
                    </Link>
                </div>
            )}

            {/* Top Navigation */}
            <header className="sticky top-0 z-40 bg-[var(--card)]/95 backdrop-blur-md border-b border-[var(--border)] transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-18">
                        {/* Logo */}
                        <div className="flex items-center gap-6">
                            <Link href="/" className="flex items-center gap-2.5 group">
                                <div className="w-9 h-9 rounded-xl bg-[#8B1E2D] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                                    <Compass className="w-5 h-5" />
                                </div>
                                <span className="font-serif font-black text-xl tracking-tight text-[var(--text)]">
                                    TN Explore
                                </span>
                            </Link>

                            {/* Nav Links */}
                            <nav className="hidden lg:flex items-center gap-1 font-medium text-xs text-[var(--muted)]">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = typeof route !== 'undefined' && route().current && item.href.includes(route().current());
                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                                                isActive
                                                    ? 'bg-stone-100 dark:bg-stone-800 text-[var(--text)] font-bold'
                                                    : 'hover:text-[var(--text)] hover:bg-stone-100/60 dark:hover:bg-stone-800/40'
                                            }`}
                                        >
                                            <Icon className="w-3.5 h-3.5 text-[#8B1E2D] dark:text-[#E7A8AF]" />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Right: Notification bell, Theme toggle, Language & Profile menu */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <LanguageToggle />
                            <ThemeToggle />
                            <NotificationBellDropdown />

                            {user ? (
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-[var(--card)] hover:bg-stone-100 dark:hover:bg-stone-800 border border-[var(--border)] text-xs font-semibold text-[var(--text)] transition-all cursor-pointer"
                                    >
                                        <div className="w-6 h-6 rounded-lg bg-[#8B1E2D] text-white font-bold flex items-center justify-center text-xs">
                                            {user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <span className="hidden sm:inline-block truncate max-w-[120px]">{user?.name}</span>
                                        <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)]" />
                                    </button>

                                    {userMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setUserMenuOpen(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                                <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
                                                    <p className="text-xs font-bold text-[var(--text)] truncate">{user?.name}</p>
                                                    <p className="text-[11px] text-[var(--muted)] truncate">{user?.email}</p>
                                                </div>

                                                <Link
                                                    href={route('dashboard')}
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                                                >
                                                    <LayoutDashboard className="w-3.5 h-3.5 text-[var(--muted)]" />
                                                    <span>Dashboard</span>
                                                </Link>

                                                {isVendor && (
                                                    <Link
                                                        href={route('vendor.studio.index')}
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                                                    >
                                                        <Store className="w-3.5 h-3.5 text-[#8B1E2D]" />
                                                        <span>Vendor Studio</span>
                                                    </Link>
                                                )}

                                                <Link
                                                    href={route('logout')}
                                                    method="post"
                                                    as="button"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
                                                >
                                                    <LogOut className="w-3.5 h-3.5" />
                                                    <span>Sign Out</span>
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={route('login')}
                                        className="text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] px-3 py-1.5 rounded-lg"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="text-xs font-semibold bg-[#8B1E2D] hover:bg-[#721824] text-white px-3.5 py-1.5 rounded-xl shadow-sm"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            )}

                            {/* Mobile menu toggle */}
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Drawer */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-[var(--border)] bg-[var(--card)] px-4 py-3 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                                >
                                    <Icon className="w-4 h-4 text-[#8B1E2D]" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </header>

            {/* Main Page Header */}
            {header && (
                <div className="bg-[var(--card)] border-b border-[var(--border)] transition-colors">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </div>
            )}

            {/* Page Content */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
