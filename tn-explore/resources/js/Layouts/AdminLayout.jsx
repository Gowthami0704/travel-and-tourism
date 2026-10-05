import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import SmartCursor from '@/Components/Themes/SmartCursor';
import ThemeToggle from '@/Components/Themes/ThemeToggle';
import {
    Compass,
    Shield,
    Users,
    Sparkles,
    AlertTriangle,
    LogOut,
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    BarChart3,
    Store,
    FileCheck2,
    Database,
    Calendar,
    MessageSquare,
    Activity,
    Lock,
    Camera,
    Image as ImageIcon,
    Menu,
    X
} from 'lucide-react';

export default function AdminLayout({ children, title, subtitle }) {
    const { auth, flash = {} } = usePage().props;
    const user = auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const isSuperAdmin = user?.role === 'admin' && (user?.admin_role === 'super_admin' || !user?.admin_role);
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';

    const navItems = [
        { label: 'Overview Dashboard', href: route('admin.dashboard'), icon: BarChart3, active: currentUrl === '/admin/dashboard' },
        { label: 'Vendors & Partners', href: route('admin.vendors.index'), icon: Store, active: currentUrl.startsWith('/admin/vendors') },
        { label: 'Custom Trips Moderation', href: route('admin.custom-trips.index'), icon: Compass, active: currentUrl.startsWith('/admin/custom-trips') },
        { label: 'KYC Verification', href: route('admin.kyc.index'), icon: FileCheck2, active: currentUrl.startsWith('/admin/kyc') },
        { label: 'Vendor Media & Fleet', href: route('admin.studio.media'), icon: Camera, active: currentUrl.startsWith('/admin/studio') },
        { label: 'Place Photos Approval', href: route('admin.place-images.index'), icon: ImageIcon, active: currentUrl.startsWith('/admin/place-images') },
        { label: 'User Directory', href: route('admin.users.index'), icon: Users, active: currentUrl.startsWith('/admin/users') },
        { label: 'Bookings Oversight', href: route('admin.bookings.index'), icon: Calendar, active: currentUrl.startsWith('/admin/bookings') },
        { label: 'Tourism Data Editor', href: route('admin.data.index'), icon: Database, active: currentUrl.startsWith('/admin/data') },
        { label: 'Review Moderation', href: route('admin.reviews.index'), icon: MessageSquare, active: currentUrl.startsWith('/admin/reviews') },
        { label: 'AI Fraud Anomaly Scanner', href: route('admin.fraud.index'), icon: AlertTriangle, active: currentUrl.startsWith('/admin/fraud') },
        { label: 'Lab System Operations', href: route('admin.system.index'), icon: Activity, active: currentUrl.startsWith('/admin/system') },
    ];

    if (isSuperAdmin) {
        navItems.push({ label: 'Audit Trail Logs', href: route('admin.audit.index'), icon: Activity, active: currentUrl.startsWith('/admin/audit') });
    }

    return (
        <div className="admin-theme min-h-screen bg-stone-100 dark:bg-slate-950 text-stone-900 dark:text-stone-100 flex font-sans antialiased transition-colors">
            <SmartCursor />

            {/* Admin Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-stone-200 dark:border-slate-800 flex flex-col justify-between p-4 hidden md:flex flex-shrink-0 shadow-sm">
                <div className="space-y-4">
                    {/* Brand Header */}
                    <div className="flex items-center gap-3 px-2 py-3 border-b border-stone-200 dark:border-slate-800">
                        <div className="w-10 h-10 rounded-2xl bg-amber-600 dark:bg-amber-500 flex items-center justify-center text-white dark:text-stone-950 font-bold shadow-md">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-serif font-black text-base text-stone-900 dark:text-white tracking-wide block">
                                TN EXPLORE
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                {isSuperAdmin ? 'Super Admin' : 'Govt Moderator'}
                            </span>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                        item.active
                                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-sm font-bold'
                                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-slate-800/50'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 flex-shrink-0 ${item.active ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400'}`} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-stone-200 dark:border-slate-800 space-y-2">
                    <Link
                        href="/"
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-50 dark:bg-slate-800/60 hover:bg-stone-100 dark:hover:bg-slate-800 text-xs font-semibold text-stone-700 dark:text-stone-300 transition-all border border-stone-200 dark:border-slate-700"
                    >
                        <span className="flex items-center gap-2">
                            <Compass className="w-4 h-4 text-amber-600" />
                            Tourist Discovery
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                    </Link>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out ({user?.name?.split(' ')[0] || 'Admin'})</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Workspace */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Admin Top Header */}
                <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-b border-stone-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                        {/* Mobile Hamburger Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white cursor-pointer"
                            aria-label="Toggle Admin Sidebar Menu"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        <div>
                            <h1 className="font-serif font-bold text-lg sm:text-2xl text-stone-900 dark:text-white leading-tight">
                                {title || 'Admin Control Panel'}
                            </h1>
                            {subtitle && <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">{subtitle}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* THEME TOGGLE */}
                        <ThemeToggle userTheme={user?.theme_preference} />

                        <Link
                            href="/"
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-xs font-medium text-stone-700 dark:text-stone-300 transition-colors"
                        >
                            <Compass className="w-3.5 h-3.5 text-amber-600" />
                            <span>Preview Tourist App</span>
                        </Link>

                        <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-stone-50 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-xs text-stone-800 dark:text-stone-200 font-bold flex items-center gap-1.5 sm:gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="truncate max-w-[100px] sm:max-w-none">{user?.name?.split(' ')[0] || 'Admin'}</span>
                        </div>
                    </div>
                </header>

                {/* Mobile Admin Navigation Drawer */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-slate-900 border-b border-stone-200 dark:border-slate-800 p-4 space-y-3 animate-in slide-in-from-top-4 duration-200 shadow-xl z-20">
                        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-slate-800">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5" />
                                Admin Management Tools ({navItems.length})
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                {isSuperAdmin ? 'Super Admin' : 'Govt Moderator'}
                            </span>
                        </div>

                        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-[60vh] overflow-y-auto pr-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                            item.active
                                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold'
                                                : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 flex-shrink-0 ${item.active ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400'}`} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="pt-2 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between gap-2">
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex-1 py-2 px-3 rounded-xl bg-stone-100 dark:bg-slate-800 text-xs font-semibold text-stone-700 dark:text-stone-300 text-center flex items-center justify-center gap-1.5"
                            >
                                <Compass className="w-3.5 h-3.5 text-amber-600" />
                                <span>Tourist View</span>
                            </Link>

                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex-1 py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-bold text-center border border-rose-200 dark:border-rose-900/50 cursor-pointer"
                            >
                                Sign Out
                            </Link>
                        </div>
                    </div>
                )}

                {/* Flash Messages */}
                {flash.success && (
                    <div className="m-4 sm:m-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{flash.success}</span>
                    </div>
                )}

                <main className="p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
