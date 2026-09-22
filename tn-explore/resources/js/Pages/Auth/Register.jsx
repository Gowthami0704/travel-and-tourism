import React, { useState } from 'react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { User, Store, ShieldCheck, ArrowRight, Sparkles, Building, MapPin, Phone, Mail, Lock, CheckCircle2 } from 'lucide-react';

export default function Register({ districts = [] }) {
    const [selectedRole, setSelectedRole] = useState('tourist');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: 'tourist',
        business_name: '',
        service_type: 'hotel',
        district_id: districts[0]?.id || '',
        description: '',
    });

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        setData('role', role);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout
            title="Create Your Account"
            subtitle="Join the smart tourism marketplace of Tamil Nadu"
        >
            <Head title="Register — TN Explore" />

            {/* Role Selection Tabs */}
            <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                    Select Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => handleRoleChange('tourist')}
                        className={`p-3.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                            selectedRole === 'tourist'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                                : 'bg-navy-lighter/60 border-white/5 text-gray-400 hover:text-white hover:border-white/20'
                        }`}
                    >
                        <User className="w-5 h-5 mb-1 text-emerald-400" />
                        <span className="font-bold text-sm text-white">Tourist / Explorer</span>
                        <span className="text-[11px] text-gray-400 mt-0.5">Discover districts, food & tours</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleRoleChange('vendor')}
                        className={`p-3.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                            selectedRole === 'vendor'
                                ? 'bg-gold/20 border-gold text-gold-light shadow-lg shadow-gold/20 scale-[1.02]'
                                : 'bg-navy-lighter/60 border-white/5 text-gray-400 hover:text-white hover:border-white/20'
                        }`}
                    >
                        <Store className="w-5 h-5 mb-1 text-gold" />
                        <span className="font-bold text-sm text-white">Local Vendor</span>
                        <span className="text-[11px] text-gray-400 mt-0.5">List hotels, food, cabs & guides</span>
                    </button>
                </div>

                {selectedRole === 'vendor' && (
                    <div className="mt-3 p-3 rounded-xl bg-gold/10 border border-gold/30 text-xs text-gold-light flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                        <p>
                            <strong>Admin Verification Flow:</strong> New vendor registrations will start with <span className="underline font-semibold">Pending</span> status until approved by TN Tourism Admin.
                        </p>
                    </div>
                )}
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Full Name */}
                <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                        {selectedRole === 'vendor' ? 'Owner / Contact Person Name' : 'Full Name'}
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                            <User className="w-4 h-4" />
                        </div>
                        <input
                            id="name"
                            name="name"
                            value={data.name}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#0D1322] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold transition-all"
                            autoComplete="name"
                            required
                            placeholder="e.g. Sundaram Pandian"
                            onChange={(e) => setData('name', e.target.value)}
                        />
                    </div>
                    <InputError message={errors.name} className="mt-1" />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#0D1322] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold transition-all"
                                autoComplete="username"
                                required
                                placeholder="name@example.com"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                            Phone Number
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                <Phone className="w-4 h-4" />
                            </div>
                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                value={data.phone}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#0D1322] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold transition-all"
                                placeholder="+91 98401 23456"
                                onChange={(e) => setData('phone', e.target.value)}
                            />
                        </div>
                        <InputError message={errors.phone} className="mt-1" />
                    </div>
                </div>

                {/* Vendor specific fields */}
                {selectedRole === 'vendor' && (
                    <div className="p-4 rounded-xl bg-navy-lighter/70 border border-gold/20 space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-gold uppercase tracking-wider mb-1.5">
                                Business / Agency Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                    <Building className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={data.business_name}
                                    className="w-full pl-10 pr-4 py-2.5 bg-[#0D1322] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold"
                                    placeholder="e.g. Meenakshi Heritage Travels"
                                    required={selectedRole === 'vendor'}
                                    onChange={(e) => setData('business_name', e.target.value)}
                                />
                            </div>
                            <InputError message={errors.business_name} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                                    Service Type
                                </label>
                                <select
                                    value={data.service_type}
                                    onChange={(e) => setData('service_type', e.target.value)}
                                    className="w-full py-2.5 px-3 bg-[#0D1322] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold"
                                >
                                    <option value="hotel">🏨 Hotel / Homestay</option>
                                    <option value="food">🍲 Food & Restaurant</option>
                                    <option value="rental_vehicle">🚗 Rental Vehicle / Cab</option>
                                    <option value="tour_package">🗺️ Tour Package / Guide</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                                    Base District
                                </label>
                                <select
                                    value={data.district_id}
                                    onChange={(e) => setData('district_id', e.target.value)}
                                    className="w-full py-2.5 px-3 bg-[#0D1322] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold"
                                >
                                    {districts.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} ({d.region})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#0D1322] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold"
                                autoComplete="new-password"
                                required
                                onChange={(e) => setData('password', e.target.value)}
                            />
                        </div>
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="w-full pl-10 pr-4 py-2.5 bg-[#0D1322] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold"
                                autoComplete="new-password"
                                required
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-gold via-gold-light to-gold text-[#0A0E1A] font-bold text-sm shadow-lg shadow-gold/25 hover:shadow-gold/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                >
                    <span>{processing ? 'Creating Account...' : `Register as ${selectedRole === 'vendor' ? 'Vendor Partner' : 'Tourist Explorer'}`}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </form>

            <div className="mt-6 pt-4 border-t border-white/5 text-center flex items-center justify-between text-xs text-gray-400">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    ← Back to Home
                </Link>
                <div className="flex items-center gap-1">
                    <span>Already have an account?</span>
                    <Link href={route('login')} className="text-gold font-semibold hover:underline">
                        Log In
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
