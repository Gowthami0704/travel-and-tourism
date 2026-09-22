import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import SmartCursor from '@/Components/Themes/SmartCursor';
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
    Lock
} from 'lucide-react';

export default function AdminLayout({ children, title, subtitle }) {
    const { auth, flash = {} } = usePage().props;
    const user = auth?.user;
    const isSuperAdmin = user?.role === 'admin' && (user?.admin_role === 'super_admin' || !user?.admin_role);
    const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';

    const navItems = [
        { label: 'Overview Dashboard', href: route('admin.dashboard'), icon: BarChart3, active: currentUrl === '/admin/dashboard' },
        { label: 'Vendors & Partners', href: route('admin.vendors.index'), icon: Store, active: currentUrl.startsWith('/admin/vendors') },
        { label: 'KYC Verification', href: route('admin.kyc.index'), icon: FileCheck2, active: currentUrl.startsWith('/admin/kyc') },
        { label: 'User Directory', href: route('admin.users.index'), icon: Users, active: currentUrl.startsWith('/admin/users') },
        { label: 'Bookings Oversight', href: route('admin.bookings.index'), icon: Calendar, active: currentUrl.startsWith('/admin/bookings') },
        { label: 'Tourism Data Editor', href: route('admin.data.index'), icon: Database, active: currentUrl.startsWith('/admin/data') },
        { label: 'Review Moderation', href: route('admin.reviews.index'), icon: MessageSquare, active: currentUrl.startsWith('/admin/reviews') },
        { label: 'AI Fraud Anomaly Scanner', href: route('admin.fraud.index'), icon: AlertTriangle, active: currentUrl.startsWith('/admin/fraud') },
    ];

    if (isSuperAdmin) {
        navItems.push({ label: 'Audit Trail Logs', href: route('admin.audit.index'), icon: Activity, active: currentUrl.startsWith('/admin/audit') });
    }

    return (
        <div className="min-h-screen bg-[#070B14] text-cream flex font-sans antialiased selection:bg-gold/30 selection:text-white">
            <SmartCursor />

            {/* Admin Sidebar */}
            <aside className="w-64 bg-[#0A0E1A] border-r border-white/10 flex flex-col justify-between p-4 hidden md:flex flex-shrink-0">
                <div className="space-y-5">
                    {/* Brand Header */}
                    <div className="flex items-center gap-3 px-2 py-3 border-b border-white/10">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold shadow-lg shadow-amber-500/20">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="font-display font-black text-base text-white tracking-wide block">
                                TN EXPLORE
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                isSuperAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}>
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
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/10'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                    <Link
                        href="/"
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-gold hover:text-black text-xs font-semibold text-gray-300 transition-all"
                    >
                        <span className="flex items-center gap-2">
                            <Compass className="w-4 h-4" />
                            Tourist Website
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out ({user?.name})</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Workspace */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Admin Top Header */}
                <header className="sticky top-0 z-20 backdrop-blur-xl bg-[#070B14]/85 border-b border-white/10 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
                            {title || 'Admin Control Panel'}
                        </h1>
                        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 transition-colors"
                        >
                            <Compass className="w-3.5 h-3.5 text-gold" />
                            <span>Preview Tourist App</span>
                        </Link>

                        <div className="px-3 py-1.5 rounded-xl bg-[#0E1526] border border-white/10 text-xs text-amber-300 font-bold flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{user?.name}</span>
                        </div>
                    </div>
                </header>

                {/* Flash Messages */}
                {flash.success && (
                    <div className="m-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                        <span>{flash.success}</span>
                    </div>
                )}

                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
