import React from 'react';
import { Link } from '@inertiajs/react';
import AdventureBackground from '@/Components/Themes/AdventureBackground';
import SmartCursor from '@/Components/Themes/SmartCursor';
import ThemeToggle from '@/Components/Themes/ThemeToggle';
import { Compass, Sparkles, ArrowLeft, Home } from 'lucide-react';

export default function GuestLayout({ children, title, subtitle, backUrl, backLabel = 'Back' }) {
    const handleBack = () => {
        if (backUrl) {
            window.location.href = backUrl;
        } else if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/';
        }
    };

    return (
        <div className="relative min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-200">
            {/* Visual Effects - Night sky only active in dark mode */}
            <AdventureBackground className="hidden dark:block opacity-60" />
            <SmartCursor />

            {/* Top Navigation Bar: Back Button & Theme Toggle */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                {backUrl ? (
                    <Link
                        href={backUrl}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-bold text-[var(--text)] hover:text-[var(--primary)] hover:border-[var(--primary)] shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                        <ArrowLeft className="w-4 h-4 text-[var(--primary)] group-hover:-translate-x-0.5 transition-transform" />
                        <span>{backLabel}</span>
                    </Link>
                ) : (
                    <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-bold text-[var(--text)] hover:text-[var(--primary)] hover:border-[var(--primary)] shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                        <ArrowLeft className="w-4 h-4 text-[var(--primary)] group-hover:-translate-x-0.5 transition-transform" />
                        <span>{backLabel}</span>
                    </button>
                )}

                <Link
                    href="/"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)] shadow-sm transition-all"
                    title="Return to Home"
                >
                    <Home className="w-3.5 h-3.5" />
                    <span>Home</span>
                </Link>
            </div>

            <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
                <ThemeToggle />
            </div>

            {/* Header / Brand Logo */}
            <div className="relative z-10 text-center mb-6">
                <Link href="/" className="inline-flex items-center gap-3.5 group">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300 border border-[var(--border)] bg-[var(--card)] p-1.5 flex items-center justify-center">
                        <img src="/images/logo.svg" alt="TN Explore Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-left flex flex-col justify-center">
                        <span className="font-serif font-black text-2xl tracking-wider text-[var(--text)] leading-none">
                            TN EXPLORE
                        </span>
                        <span className="text-[9.5px] font-bold tracking-[0.22em] text-[var(--primary)] uppercase mt-1 leading-none">
                            TAMIL NADU TOURISM
                        </span>
                    </div>
                </Link>
                {title && (
                    <h1 className="mt-4 font-serif text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
                        {title}
                    </h1>
                )}
                {subtitle && (
                    <p className="mt-1.5 text-xs sm:text-sm text-[var(--muted)] max-w-sm mx-auto leading-relaxed">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Content Card using Theme Tokens */}
            <div className="relative z-10 w-full max-w-xl">
                <div className="bg-[var(--card)] border border-[var(--border)] shadow-xl rounded-2xl p-6 sm:p-8 transition-colors duration-200 text-[var(--text)]">
                    {children}
                </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="relative z-10 mt-8 text-center text-xs text-[var(--muted)]">
                <p>© {new Date().getFullYear()} TN Explore • Two-Sided Smart Tourism Platform</p>
            </div>
        </div>
    );
}
