import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import SmartCursor from '@/Components/Themes/SmartCursor';
import TnMitraChatBubble from '@/Components/Ai/TnMitraChatBubble';
import { Compass, Sparkles, MapPin, Search, User, Users, Shield, Store, Menu, X, LogOut, Heart, Calendar, ArrowRight, Bot } from 'lucide-react';

export default function MainLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="min-h-screen bg-[#0A0E1A] text-cream flex flex-col font-sans selection:bg-gold/30 selection:text-white antialiased">
            {/* Custom Interactive Smart Cursor */}
            <SmartCursor />

            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#0A0E1A]/85 border-b border-white/10 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Brand Logo */}
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-3.5 group">
                                <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-gold/25 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 flex-shrink-0 border border-gold/30">
                                    <img src="/images/logo.svg" alt="TN Explore Adventure Logo" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className="font-display font-black text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-cream to-gold leading-none">
                                        TN EXPLORE
                                    </span>
                                    <span className="text-[9px] font-semibold tracking-[0.26em] text-amber-400/80 uppercase mt-1 leading-none">
                                        TAMIL NADU TOURISM
                                    </span>
                                </div>
                            </Link>

                            {/* Nav Links */}
                            <div className="hidden md:flex items-center gap-2 pl-6 border-l border-white/10">
                                <Link
                                    href="/"
                                    className="px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-gold hover:text-gold-light hover:bg-white/5 transition-all"
                                >
                                    Districts (38)
                                </Link>

                                <Link
                                    href="/ai-guide"
                                    className="px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-all flex items-center gap-1.5"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                                    <span>AI Guide ✨</span>
                                </Link>

                                <Link
                                    href="/trip-builder"
                                    className="px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 transition-all flex items-center gap-1.5"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                                    <span>Toy Trip Builder</span>
                                </Link>

                                <Link
                                    href="/trip-mates"
                                    className="px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 transition-all flex items-center gap-1.5"
                                >
                                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Trip Mates 👥</span>
                                </Link>
                            </div>
                        </div>

                        {/* Right Actions / Auth Menu */}
                        <div className="hidden md:flex items-center gap-4">
                            {user ? (
                                <div className="flex items-center gap-3">
                                    {/* Role Badge & Dashboard Link */}
                                    {user.role === 'admin' && (
                                        <Link
                                            href={route('admin.dashboard')}
                                            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1.5 hover:bg-amber-500/30 transition-all"
                                        >
                                            <Shield className="w-4 h-4" />
                                            Admin Panel
                                        </Link>
                                    )}

                                    {user.role === 'vendor' && (
                                        <Link
                                            href={route('vendor.dashboard')}
                                            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold text-xs flex items-center gap-1.5 hover:bg-cyan-500/30 transition-all"
                                        >
                                            <Store className="w-4 h-4" />
                                            Vendor Studio
                                        </Link>
                                    )}

                                    <Link
                                        href={route('dashboard')}
                                        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-navy-lighter/80 border border-white/10 hover:border-gold/40 text-xs font-medium text-white transition-all group"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-forest-light/60 flex items-center justify-center text-emerald-300 font-bold text-[11px]">
                                            {user.name.charAt(0)}
                                        </div>
                                        <span className="font-semibold text-gray-200 group-hover:text-gold transition-colors">
                                            {user.name.split(' ')[0]}
                                        </span>
                                    </Link>

                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                        title="Log Out"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2.5">
                                    <Link
                                        href={route('vendor.register')}
                                        className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-all"
                                    >
                                        <Store className="w-3.5 h-3.5" />
                                        <span>Partner With Us</span>
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold via-gold-light to-gold text-[#0A0E1A] font-bold text-xs shadow-lg shadow-gold/20 hover:shadow-gold/35 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Explore TN
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-xl bg-white/5 text-gray-300 hover:text-white"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden px-4 pt-2 pb-6 bg-navy-card/95 border-b border-white/10 space-y-3">
                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:bg-white/5"
                        >
                            🏛️ Explore 38 Districts
                        </Link>
                        <Link
                            href="/ai-guide"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-lg text-sm font-semibold text-amber-300 hover:bg-amber-500/10"
                        >
                            ✨ TN Mitra AI Guide (Chatbot)
                        </Link>
                        <Link
                            href="/trip-builder"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-lg text-sm font-semibold text-purple-300 hover:bg-purple-500/10"
                        >
                            🗺️ Toy Trip Builder & Budget
                        </Link>
                        <Link
                            href="/trip-mates"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-lg text-sm font-semibold text-emerald-300 hover:bg-emerald-500/10"
                        >
                            👥 Trip Mates Hub (Travel Companions)
                        </Link>
                        <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                            {user ? (
                                <>
                                    <Link
                                        href={route('dashboard')}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-4 py-2.5 rounded-xl bg-forest/40 text-emerald-300 text-sm font-semibold text-center"
                                    >
                                        My Tourist Dashboard ({user.name})
                                    </Link>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-semibold text-center"
                                    >
                                        Log Out
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-4 py-2.5 rounded-xl bg-white/5 text-white text-sm font-semibold text-center"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="px-4 py-2.5 rounded-xl bg-gold text-[#0A0E1A] text-sm font-bold text-center"
                                    >
                                        Create Account
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Page Content */}
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="bg-[#070B14] border-t border-white/10 pt-12 pb-8 text-gray-400 text-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-gold flex items-center justify-center text-[#0A0E1A] font-bold">
                                    <Compass className="w-5 h-5" />
                                </div>
                                <span className="font-display font-bold text-lg text-white">TN EXPLORE</span>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                AI-Powered Two-Sided Smart Tourism Marketplace for Tamil Nadu. Connecting tourists with authentic heritage, dishes, offbeat hidden gems, and verified local vendors.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white uppercase tracking-wider mb-3">Districts by Region</h4>
                            <ul className="space-y-1.5 text-gray-400">
                                <li>• North (Chennai, Vellore, Kanchipuram...)</li>
                                <li>• South (Madurai, Tirunelveli, Kanyakumari...)</li>
                                <li>• Kongu (Coimbatore, Nilgiris, Salem, Erode...)</li>
                                <li>• Central (Tiruchirappalli, Thanjavur...)</li>
                                <li>• Coastal (Ramanathapuram, Cuddalore...)</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white uppercase tracking-wider mb-3">Platform Roles</h4>
                            <ul className="space-y-1.5 text-gray-400">
                                <li>• <strong>Tourists:</strong> Explore, plan itineraries & book packages</li>
                                <li>
                                    • <Link href={route('vendor.register')} className="text-gold hover:underline font-semibold">
                                        Partner With Us (Vendor Registration)
                                    </Link>
                                </li>
                                <li>
                                    • <Link href={route('vendor.login')} className="text-cyan-400 hover:underline">
                                        Vendor B2B Portal Sign In
                                    </Link>
                                </li>
                                <li>• <strong>Admin:</strong> Audit fraud flags & verify business listings</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-white uppercase tracking-wider mb-3">Smart Features</h4>
                            <ul className="space-y-1.5 text-gray-400">
                                <li>• 38 Districts auto-fetched from Wikipedia</li>
                                <li>• Isolation Forest AI Vendor Trust Scoring</li>
                                <li>• Static multi-modal travel cost comparison</li>
                                <li>• Interactive Trip Budget & Cost Calculator</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-gray-500">
                        <p>© {new Date().getFullYear()} TN Explore. Department of Tourism & Smart Governance initiative.</p>
                        <p className="flex items-center gap-1 justify-center">
                            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Tamil Nadu Tourism
                        </p>
                    </div>
                </div>
            </footer>

            {/* Floating TN Mitra AI Travel Companion Chat Bubble */}
            <TnMitraChatBubble />
        </div>
    );
}
