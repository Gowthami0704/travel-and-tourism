import React, { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
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
    User,
    Check
} from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);

    const rolePresets = [
        {
            id: 'tourist',
            title: 'Tourist / User',
            subtitle: 'Explore 38 Districts & Bookings',
            email: 'user@tnexplore.com',
            password: 'password',
            icon: Compass,
            badge: 'Tourist Portal',
            badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
            buttonClass: 'bg-teal-600 hover:bg-teal-500 text-white',
            borderHover: 'hover:border-teal-400',
        },
        {
            id: 'admin',
            title: 'Admin Officer',
            subtitle: 'KYC Queue & Platform Control',
            email: 'admin@tnexplore.gov.in',
            password: 'password',
            icon: ShieldCheck,
            badge: 'Admin Center',
            badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            buttonClass: 'bg-amber-600 hover:bg-amber-500 text-white',
            borderHover: 'hover:border-amber-400',
        },
        {
            id: 'vendor',
            title: 'Vendor Partner',
            subtitle: 'Fleet, Packages & Leads',
            email: 'vendor@tnexplore.com',
            password: 'password',
            icon: Store,
            badge: 'Partner Hub',
            badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
            buttonClass: 'bg-orange-600 hover:bg-orange-500 text-white',
            borderHover: 'hover:border-orange-400',
        },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        email: 'user@tnexplore.com',
        password: 'password',
        remember: true,
    });

    // 1-Click Instant Automatic Login
    const handleInstantLogin = (preset) => {
        setIsAutoLoggingIn(true);
        setData({
            email: preset.email,
            password: preset.password,
            remember: true,
        });

        router.post(route('login'), {
            email: preset.email,
            password: preset.password,
            remember: true,
        }, {
            onFinish: () => {
                setIsAutoLoggingIn(false);
            },
        });
    };

    // Fill form only so user can modify before submitting
    const handleFillOnly = (e, preset) => {
        e.stopPropagation();
        setData({
            ...data,
            email: preset.email,
            password: preset.password,
        });
    };

    const submit = (e) => {
        if (e) e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout
            title="Sign In to TN Explore"
            subtitle="Access your smart tourism dashboard, bookings, or partner hub"
        >
            <Head title="Sign In — TN Explore" />

            {status && (
                <div className="mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{status}</span>
                </div>
            )}

            {/* 1-CLICK AUTOMATIC ROLE LOGINS */}
            <div className="mb-6 p-4 rounded-3xl bg-slate-900/90 dark:bg-stone-900/90 border border-amber-400/30 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                        1-Click Automatic Role Login
                    </span>
                    <span className="text-[10px] text-gray-400">Instant Access</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                    Click any role below to <strong className="text-amber-300">automatically log in immediately</strong>, or modify credentials in the form below.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {rolePresets.map((preset) => {
                        const Icon = preset.icon;
                        const isSelected = data.email === preset.email;
                        return (
                            <div
                                key={preset.id}
                                onClick={() => handleInstantLogin(preset)}
                                className={`group relative p-3 rounded-2xl bg-black/40 border transition-all duration-200 cursor-pointer flex flex-col justify-between text-left hover:-translate-y-0.5 hover:shadow-lg ${
                                    isSelected
                                        ? 'border-amber-400 bg-amber-950/20 shadow-amber-500/10'
                                        : 'border-white/10 hover:border-white/30'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${preset.badgeClass}`}>
                                            {preset.badge}
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                                        {preset.title}
                                    </h4>
                                    <p className="text-[10px] text-gray-400 font-mono truncate mt-0.5">
                                        {preset.email}
                                    </p>
                                </div>

                                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-1">
                                    <button
                                        type="button"
                                        disabled={isAutoLoggingIn || processing}
                                        className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm transition-all ${preset.buttonClass}`}
                                    >
                                        <Zap className="w-3 h-3 fill-current" />
                                        <span>Auto Login →</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MANUAL / EDITABLE LOGIN FORM */}
            <form onSubmit={submit} className="space-y-4">
                <div className="flex items-center gap-2 py-1">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Or Edit Credentials</span>
                    <div className="h-px bg-white/10 flex-1" />
                </div>

                {/* Email Field */}
                <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                        Email Address *
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                            <Mail className="w-4 h-4" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder="your.email@example.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-stone-300 dark:border-slate-700 rounded-xl text-sm text-stone-900 dark:text-white placeholder-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            autoComplete="username"
                            required
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1" />
                </div>

                {/* Password Field */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                            Password *
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                            <Lock className="w-4 h-4" />
                        </div>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-950 border border-stone-300 dark:border-slate-700 rounded-xl text-sm text-stone-900 dark:text-white placeholder-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                            autoComplete="current-password"
                            required
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1" />
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="text-xs text-stone-600 dark:text-stone-400">Keep me signed in</span>
                    </label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={processing || isAutoLoggingIn}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                    <Zap className="w-4 h-4 fill-current text-stone-950" />
                    <span>{processing || isAutoLoggingIn ? 'Authenticating...' : 'Sign In to Portal →'}</span>
                </button>

                {/* Footer Links */}
                <div className="pt-4 border-t border-stone-200 dark:border-slate-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <Link href="/" className="hover:text-amber-500 transition-colors flex items-center gap-1">
                        ← Back to Districts
                    </Link>
                    <span>
                        Partner onboarding?{' '}
                        <Link href={route('vendor.register')} className="font-bold text-amber-600 dark:text-amber-400 hover:underline">
                            Register Partner
                        </Link>
                    </span>
                </div>
            </form>
        </GuestLayout>
    );
}
