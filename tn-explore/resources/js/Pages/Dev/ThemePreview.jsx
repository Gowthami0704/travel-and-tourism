import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Button from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import StatusChip from '@/Components/UI/StatusChip';
import ThemeToggle from '@/Components/ThemeToggle';
import LanguageToggle from '@/Components/LanguageToggle';
import { NotificationBellDropdown } from '@/Components/NotificationBanner';
import { 
    Compass, 
    Sparkles, 
    CheckCircle2, 
    AlertTriangle, 
    Calendar, 
    Users, 
    MapPin, 
    Heart, 
    Share2, 
    IndianRupee,
    Car,
    Shield,
    Info,
    ArrowRight
} from 'lucide-react';

export default function ThemePreview() {
    const [selectedTab, setSelectedTab] = useState('buttons');
    const [textInputVal, setTextInputVal] = useState('Chennai Heritage Walk');
    const [mockToastOpen, setMockToastOpen] = useState(true);

    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">
            <Head title="Theme Tokens & Design System Gallery" />

            {/* Preview Navigation Bar */}
            <header className="sticky top-0 z-40 bg-[var(--card)]/95 backdrop-blur-md border-b border-[var(--border)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#8B1E2D] text-white flex items-center justify-center">
                            <Compass className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-serif font-black text-lg text-[var(--text)]">TN Explore Design System</span>
                            <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#8B1E2D]/10 text-[#8B1E2D] dark:text-[#E7A8AF]">
                                /dev/theme
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <LanguageToggle />
                        <ThemeToggle />
                        <NotificationBellDropdown />
                        <Link href="/" className="text-xs font-semibold text-[var(--primary)] hover:underline">
                            Back to App →
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
                {/* Intro Card */}
                <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
                    <h1 className="text-2xl font-serif font-black text-[var(--text)] tracking-tight">
                        Design Tokens & Component Verification
                    </h1>
                    <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed">
                        This environment previews all shared components in light and dark mode simultaneously. All tokens maintain WCAG AA contrast standards with maroon (#8B1E2D) brand accents.
                    </p>
                </div>

                {/* Section 1: Unified Button System */}
                <div className="space-y-4">
                    <h2 className="text-lg font-serif font-bold text-[var(--text)] flex items-center gap-2">
                        <span>1. Unified Button System</span>
                        <span className="text-xs font-normal text-[var(--muted)]">(Max 1 Primary per screen)</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Primary Button */}
                        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-3">
                            <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Primary (Maroon)</div>
                            <Button variant="primary" className="w-full">
                                Confirm Booking
                            </Button>
                            <Button variant="primary" disabled className="w-full">
                                Disabled Primary (Readable)
                            </Button>
                        </div>

                        {/* Secondary Button */}
                        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-3">
                            <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Secondary (Outline)</div>
                            <Button variant="secondary" className="w-full">
                                Customize Plan
                            </Button>
                            <Button variant="secondary" disabled className="w-full">
                                Disabled Secondary
                            </Button>
                        </div>

                        {/* Tertiary Button */}
                        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-3">
                            <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Tertiary (Link)</div>
                            <Button variant="tertiary" className="w-full">
                                View Details →
                            </Button>
                            <Button variant="tertiary" disabled className="w-full">
                                Disabled Link
                            </Button>
                        </div>

                        {/* Destructive Button */}
                        <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-3">
                            <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Destructive (Red)</div>
                            <Button variant="destructive" className="w-full">
                                Cancel Booking
                            </Button>
                            <Button variant="destructive" disabled className="w-full">
                                Disabled Danger
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Section 2: Cards & Form Elements */}
                <div className="space-y-4">
                    <h2 className="text-lg font-serif font-bold text-[var(--text)]">
                        2. Form Controls, Inputs & Chips
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Form controls */}
                        <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-4">
                            <h3 className="text-sm font-bold text-[var(--text)]">Standard Inputs</h3>
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Destination Name</label>
                                <input
                                    type="text"
                                    value={textInputVal}
                                    onChange={(e) => setTextInputVal(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] focus:ring-2 focus:ring-[#8B1E2D]/40 outline-none"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#8B1E2D] text-white">
                                    Temples (Active)
                                </span>
                                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-[var(--text)] border border-[var(--border)]">
                                    Hills
                                </span>
                                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-[var(--text)] border border-[var(--border)]">
                                    Beaches
                                </span>
                            </div>
                        </div>

                        {/* Status Badges */}
                        <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-4">
                            <h3 className="text-sm font-bold text-[var(--text)]">Status Badges & Verification</h3>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Verified Partner
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Pending Review
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#8B1E2D]/15 text-[#8B1E2D] dark:text-[#E7A8AF] border border-[#8B1E2D]/30">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    AI Fair Price
                                </span>
                            </div>

                            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-[var(--border)] text-xs text-[var(--muted)]">
                                Formatted Amount Standard: <strong className="text-[var(--text)]">₹9,996 total (4 × ₹2,499)</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Floating Toast Preview */}
                <div className="space-y-4">
                    <h2 className="text-lg font-serif font-bold text-[var(--text)]">
                        3. Single-Fire Floating Toast Notification
                    </h2>

                    <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-4">
                        <div className="max-w-md rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xl p-4 flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 flex-shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-[var(--text)]">Trip Booking Accepted</h4>
                                <p className="text-xs text-[var(--muted)] mt-1">
                                    Vendor "Meenakshi Heritage Travels" accepted your trip booking.
                                </p>
                                <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                                    ₹9,996 total (4 × ₹2,499)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
