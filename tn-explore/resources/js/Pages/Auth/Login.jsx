import React, { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Compass,
    ShieldCheck,
    Store,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Eye,
    EyeOff,
    Lock,
    Mail,
    Zap,
    KeyRound,
    MapPin,
    Building2,
    SlidersHorizontal,
    Check
} from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const [activeRole, setActiveRole] = useState('user');
    const [showPassword, setShowPassword] = useState(false);

    // 3 Primary Roles Definition
    const rolePresets = {
        user: {
            id: 'user',
            role: 'User / Tourist',
            badge: 'Explorer Portal',
            email: 'user@tnexplore.com',
            password: 'password',
            name: 'Kavitha Ramachandran',
            subtitle: 'Discover 38 Districts, Secret Gems & Food Trail',
            description: 'Full access to interactive district maps, AI travel planner, secret hidden gems, authentic culinary dishes, and verified homestays.',
            icon: Compass,
            color: 'emerald',
            gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
            borderClass: 'border-emerald-500/40',
            activeBorder: 'border-emerald-400 ring-2 ring-emerald-500/30',
            activeBg: 'bg-emerald-950/40',
            glowColor: 'shadow-emerald-500/15',
            accentText: 'text-emerald-400',
            badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
            features: ['38 Districts Explorer', 'AI Smart Itinerary', 'Secret Hidden Gems', 'Stay & Package Bookings']
        },
        admin: {
            id: 'admin',
            role: 'Admin / Officer',
            badge: 'Govt Portal',
            email: 'admin@tnexplore.gov.in',
            password: 'password',
            name: 'TN Tourism Admin',
            subtitle: 'Audit AI Fraud Flags, Approve Vendors & Manage Gems',
            description: 'Executive oversight to review AI pricing anomalies, approve/reject newly registered tour operators, and verify secret spot submissions.',
            icon: ShieldCheck,
            color: 'amber',
            gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
            borderClass: 'border-amber-500/40',
            activeBorder: 'border-amber-400 ring-2 ring-amber-500/30',
            activeBg: 'bg-amber-950/40',
            glowColor: 'shadow-amber-500/15',
            accentText: 'text-amber-400',
            badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
            features: ['AI Fraud Detector', 'Vendor KYC Approvals', 'Hidden Gem Curator', 'Tourism Analytics']
        },
        vendor: {
            id: 'vendor',
            role: 'Vendor / Partner',
            badge: 'Business Hub',
            email: 'vendor@tnexplore.com',
            password: 'password',
            name: 'Sundaram Pandian (Meenakshi Heritage)',
            subtitle: 'Manage Stays, Cultural Tours & Live Bookings',
            description: 'Commercial dashboard for verified hoteliers, cab providers, and tour guides to list packages, track traveler bookings, and maintain high trust score.',
            icon: Store,
            color: 'cyan',
            gradient: 'from-cyan-500/20 via-cyan-500/10 to-transparent',
            borderClass: 'border-cyan-500/40',
            activeBorder: 'border-cyan-400 ring-2 ring-cyan-500/30',
            activeBg: 'bg-cyan-950/40',
            glowColor: 'shadow-cyan-500/15',
            accentText: 'text-cyan-400',
            badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
            features: ['Listing Management', 'Real-time Bookings', 'AI Trust Score (94%)', 'Direct Tourist Inquiries']
        }
    };

    // Pre-fill User credentials by default
    const { data, setData, post, processing, errors, reset } = useForm({
        email: rolePresets.user.email,
        password: rolePresets.user.password,
        remember: true,
    });

    const handleSelectRole = (key) => {
        setActiveRole(key);
        setData({
            ...data,
            email: rolePresets[key].email,
            password: rolePresets[key].password,
        });
    };

    const submit = (e) => {
        if (e) e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const currentPreset = rolePresets[activeRole];

    return (
        <GuestLayout
            title="Sign In to TN Explore"
            subtitle="Select your role to access your specialized portal"
        >
            <Head title="Sign In — TN Explore" />

            {status && (
                <div className="mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-sm font-medium text-emerald-400 flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{status}</span>
                </div>
            )}

            {/* 3 ROLES SELECTOR TABS */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-gold animate-pulse" />
                        Choose Access Role
                    </span>
                    <span className="text-[11px] font-medium text-gold/90 bg-gold/10 px-2 py-0.5 rounded-full border border-gold/20">
                        Easy Password: <code className="font-mono font-bold text-white">password</code>
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                    {Object.entries(rolePresets).map(([key, preset]) => {
                        const Icon = preset.icon;
                        const isSelected = activeRole === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => handleSelectRole(key)}
                                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                                    isSelected
                                        ? `${preset.activeBg} ${preset.activeBorder} shadow-lg ${preset.glowColor} scale-[1.03]`
                                        : 'bg-[#0E1526]/70 border-white/10 text-gray-400 hover:text-white hover:border-white/25 hover:bg-[#121B30]'
                                }`}
                            >
                                {isSelected && (
                                    <span className="absolute -top-2 -right-1.5 w-5 h-5 rounded-full bg-gold text-[#0A0E1A] flex items-center justify-center shadow-md animate-bounce">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                    </span>
                                )}
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
                                    isSelected ? `${preset.badgeBg}` : 'bg-white/5 text-gray-400'
                                }`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                    {preset.role.split('/')[0].trim()}
                                </span>
                                <span className="text-[10px] text-gray-400 mt-0.5 font-medium leading-none">
                                    {preset.badge}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Active Role Details & Features Card */}
                <div className={`mt-3.5 p-3.5 rounded-xl border bg-gradient-to-br ${currentPreset.gradient} ${currentPreset.borderClass} transition-all duration-300`}>
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${currentPreset.accentText} uppercase tracking-wider`}>
                                    Role Selected: {currentPreset.role}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${currentPreset.badgeBg} font-semibold`}>
                                    {currentPreset.badge}
                                </span>
                            </div>
                            <p className="text-xs text-gray-200 font-medium mt-1">
                                {currentPreset.subtitle}
                            </p>
                        </div>
                    </div>

                    <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                        {currentPreset.description}
                    </p>

                    {/* Features Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {currentPreset.features.map((feat, idx) => (
                            <span
                                key={idx}
                                className="text-[10px] bg-black/40 text-gray-300 px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1"
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${currentPreset.accentText.replace('text-', 'bg-')}`} />
                                {feat}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* LOGIN FORM */}
            <form onSubmit={submit} className="space-y-4">
                {/* Email Field */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                            Username / Email Address
                        </label>
                        <span className="text-[11px] text-gray-400">
                            Auto-filled for <strong className="text-white">{currentPreset.role.split('/')[0]}</strong>
                        </span>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gold transition-colors">
                            <Mail className="w-4 h-4" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#0B1120]/90 border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold transition-all"
                            autoComplete="username"
                            required
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                {/* Password Field */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                            Password
                        </label>
                        <span className="text-[11px] text-gold font-mono font-medium">
                            Preset: <code className="bg-gold/15 px-1.5 py-0.5 rounded text-white font-bold">password</code>
                        </span>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gold transition-colors">
                            <Lock className="w-4 h-4" />
                        </div>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="w-full pl-10 pr-10 py-2.5 bg-[#0B1120]/90 border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold transition-all"
                            autoComplete="current-password"
                            required
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Remember Checkbox */}
                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded bg-[#0B1120] border-white/20 text-gold focus:ring-gold/50"
                        />
                        <span className="text-xs text-gray-400">Remember session</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-xs text-gold/80 hover:text-gold transition-colors"
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>

                {/* Primary Submit Button */}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-gold via-amber-300 to-gold text-[#0A0E1A] font-bold text-sm shadow-xl shadow-gold/20 hover:shadow-gold/35 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                >
                    <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                    <span>{processing ? 'Authenticating...' : `Enter as ${currentPreset.role}`}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </form>

            {/* Quick Demo Credentials Guide */}
            <div className="mt-5 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-gray-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-gold flex-shrink-0" />
                    <span><strong>Quick Demo:</strong> Click any role card above to auto-switch username & password</span>
                </div>
            </div>

            {/* Quick Link to Register / Explore */}
            <div className="mt-5 pt-4 border-t border-white/5 text-center flex items-center justify-between text-xs text-gray-400">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                    ← Back to Districts
                </Link>
                <div className="flex items-center gap-1">
                    <span>Need a new account?</span>
                    <Link href={route('register')} className="text-gold font-semibold hover:underline">
                        Register
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
