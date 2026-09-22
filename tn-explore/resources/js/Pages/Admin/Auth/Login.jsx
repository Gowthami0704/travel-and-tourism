import React, { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ShieldCheck,
    Lock,
    Mail,
    Zap,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    Shield
} from 'lucide-react';

export default function AdminLogin({ status }) {
    const [selectedRole, setSelectedRole] = useState('super_admin');
    const [showPassword, setShowPassword] = useState(false);

    const rolePresets = {
        super_admin: {
            email: 'admin@tnexplore.gov.in',
            password: 'password',
            roleName: 'Super Administrator',
            badge: 'Full Access',
            desc: 'Complete control over revenue analytics, user bans, data records, and system audit logs.',
        },
        moderator: {
            email: 'moderator@tnexplore.gov.in',
            password: 'password',
            roleName: 'Government Moderator',
            badge: 'Moderation Hub',
            desc: 'Audit vendor listings, inspect KYC permits, and approve traveler feedback reviews.',
        }
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        email: rolePresets.super_admin.email,
        password: rolePresets.super_admin.password,
        remember: true,
    });

    const handleRoleSelect = (roleKey) => {
        setSelectedRole(roleKey);
        setData({
            ...data,
            email: rolePresets[roleKey].email,
            password: rolePresets[roleKey].password,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.login.store'), {
            onFinish: () => reset('password'),
        });
    };

    const currentPreset = rolePresets[selectedRole];

    return (
        <GuestLayout
            title="State Administration Portal"
            subtitle="Secure gateway for Tamil Nadu Tourism Board Officers & Super Admins"
        >
            <Head title="Admin Sign In — TN Explore" />

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-medium text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{status}</span>
                </div>
            )}

            {/* Role Selectors */}
            <div className="mb-5 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Choose Administrative Access Role
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                    {Object.entries(rolePresets).map(([key, preset]) => {
                        const isSelected = selectedRole === key;
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => handleRoleSelect(key)}
                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                    isSelected
                                        ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                                        : 'bg-slate-950/60 border-white/10 text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-gray-300'}`}>
                                        {preset.roleName}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-gray-300 font-semibold">
                                        {preset.badge}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 leading-tight">
                                    {preset.desc}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Email Field */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                            Administrator Email
                        </label>
                        <span className="text-[11px] text-amber-300 font-mono">
                            Auto-filled for {currentPreset.roleName}
                        </span>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-400 transition-colors">
                            <Mail className="w-4 h-4" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-400 transition-all"
                            autoComplete="username"
                            required
                            onChange={(e) => setData('email', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                {/* Password Field */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                            Password
                        </label>
                        <span className="text-[11px] text-amber-300 font-mono font-medium">
                            Demo: <code className="bg-amber-500/15 px-1.5 py-0.5 rounded text-white font-bold">password</code>
                        </span>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-400 transition-colors">
                            <Lock className="w-4 h-4" />
                        </div>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-white/15 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-400 transition-all"
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
                            className="rounded bg-slate-950 border-white/20 text-amber-500 focus:ring-amber-500/50"
                        />
                        <span className="text-xs text-gray-400">Remember admin session</span>
                    </label>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                    <ShieldCheck className="w-4 h-4 fill-current" />
                    <span>{processing ? 'Verifying Credentials...' : `Enter as ${currentPreset.roleName}`}</span>
                    <ArrowRight className="w-4 h-4" />
                </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/5 text-center flex items-center justify-between text-xs text-gray-400">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    ← Back to Discovery
                </Link>
                <Link href={route('vendor.login')} className="text-cyan-400 hover:underline">
                    Vendor Partner Login →
                </Link>
            </div>
        </GuestLayout>
    );
}
