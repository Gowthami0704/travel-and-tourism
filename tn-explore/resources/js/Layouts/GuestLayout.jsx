import React from 'react';
import { Link } from '@inertiajs/react';
import AdventureBackground from '@/Components/Themes/AdventureBackground';
import SmartCursor from '@/Components/Themes/SmartCursor';
import { Compass, Sparkles } from 'lucide-react';

export default function GuestLayout({ children, title, subtitle }) {
    return (
        <div className="relative min-h-screen bg-[#060913] text-cream flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 overflow-hidden selection:bg-gold/30 selection:text-white">
            {/* Visual Effects */}
            <AdventureBackground />
            <SmartCursor />

            {/* Ambient Background Lighting Orbs */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-forest/40 via-gold/15 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-forest-accent/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header / Brand Logo */}
            <div className="relative z-10 text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-3.5 group">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-gold/25 group-hover:scale-105 transition-transform duration-300 border border-gold/30">
                        <img src="/images/logo.svg" alt="TN Explore Adventure Logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-left flex flex-col justify-center">
                        <span className="font-display font-black text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-cream to-gold leading-none">
                            TN EXPLORE
                        </span>
                        <span className="text-[9.5px] font-semibold tracking-[0.26em] text-amber-400/80 uppercase mt-1 leading-none">
                            TAMIL NADU TOURISM
                        </span>
                    </div>
                </Link>
                {title && (
                    <h1 className="mt-4 font-display text-2xl font-bold text-white tracking-tight">
                        {title}
                    </h1>
                )}
                {subtitle && (
                    <p className="mt-1 text-sm text-gray-400 max-w-sm mx-auto">
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Glassmorphic Content Card */}
            <div className="relative z-10 w-full max-w-xl">
                <div className="backdrop-blur-xl bg-navy-card/85 border border-white/10 shadow-2xl shadow-black/60 rounded-2xl p-6 sm:p-8">
                    {children}
                </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="relative z-10 mt-8 text-center text-xs text-gray-500">
                <p>© {new Date().getFullYear()} TN Explore • Two-Sided Smart Tourism Platform</p>
            </div>
        </div>
    );
}
