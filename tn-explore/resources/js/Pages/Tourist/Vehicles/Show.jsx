import React, { useState, useEffect } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Car,
    ShieldCheck,
    CheckCircle2,
    Users,
    Briefcase,
    Fuel,
    Wind,
    Calendar,
    Calculator,
    Sparkles,
    ArrowRight,
    MapPin,
    Clock,
    AlertCircle,
    Check,
    PhoneCall,
    MessageSquare,
    Store,
    Sliders
} from 'lucide-react';

export default function VehicleShow({ vehicle = {}, similarVehicles = [] }) {
    const media = vehicle.approved_media || [];
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

    // Live Price Estimator state
    const [estKm, setEstKm] = useState(350);
    const [estDays, setEstDays] = useState(2);
    const [estNights, setEstNights] = useState(1);
    const [estimateData, setEstimateData] = useState(null);
    const [calculating, setCalculating] = useState(false);

    const rates = vehicle.rates || {};

    const fetchEstimate = async () => {
        setCalculating(true);
        try {
            const response = await fetch(route('vehicles.estimate', { id: vehicle.id }), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getCsrfCookie(),
                },
                body: JSON.stringify({
                    km: estKm,
                    days: estDays,
                    nights: estNights,
                }),
            });
            const result = await response.json();
            if (result.success) {
                setEstimateData(result);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setCalculating(false);
        }
    };

    useEffect(() => {
        fetchEstimate();
    }, [estKm, estDays, estNights]);

    function getCsrfCookie() {
        const match = document.cookie.match(new RegExp('(^|;\\s*)(XSRF-TOKEN=)([^;]*)'));
        return match ? decodeURIComponent(match[3]) : '';
    }

    const currentImage = media[selectedPhotoIndex]?.medium_path || media[selectedPhotoIndex]?.path;

    return (
        <MainLayout>
            <Head title={`${vehicle.make_model} (${vehicle.year}) Rental in Tamil Nadu — TN Explore`} />

            <div className="min-h-screen bg-[#FFFDF7] dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* BREADCRUMBS */}
                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                        <Link href="/" className="hover:text-amber-500">Home</Link>
                        <span>/</span>
                        <Link href={route('vehicles.index')} className="hover:text-amber-500">Fleet Cabs</Link>
                        <span>/</span>
                        <span className="text-stone-900 dark:text-white font-bold">{vehicle.make_model}</span>
                    </div>

                    {/* MAIN TWO-COLUMN GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT 2 COLS: GALLERY, SPECS, RATE CARD */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* 1. PHOTO GALLERY (16:10 Cover + Thumbnails) */}
                            <div className="space-y-3">
                                <div className="relative aspect-[16/10] rounded-3xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden shadow-lg">
                                    {currentImage ? (
                                        <img
                                            src={currentImage}
                                            alt={vehicle.make_model}
                                            className="w-full h-full object-cover transition-all duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                                            <Car className="w-16 h-16" />
                                        </div>
                                    )}

                                    <div className="absolute top-4 left-4 flex items-center gap-2">
                                        <span className="px-3 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                                            {vehicle.type?.replace('_', ' ')}
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-emerald-500 text-stone-950 text-xs font-black flex items-center gap-1 shadow-md">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            RC & Insurance Verified ✓
                                        </span>
                                    </div>
                                </div>

                                {/* Thumbnail Selector */}
                                {media.length > 1 && (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                                        {media.map((m, idx) => (
                                            <button
                                                key={m.id || idx}
                                                type="button"
                                                onClick={() => setSelectedPhotoIndex(idx)}
                                                className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                                    selectedPhotoIndex === idx
                                                        ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md scale-105'
                                                        : 'border-transparent opacity-70 hover:opacity-100'
                                                }`}
                                            >
                                                <img src={m.thumb_path || m.path} alt="Thumb" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 2. TITLE & SPECIFICATIONS */}
                            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
                                            {vehicle.make_model} ({vehicle.year})
                                        </h1>
                                        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-1">
                                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                                            <span>Hub: {vehicle.district?.name || 'Tamil Nadu'}</span>
                                            <span>•</span>
                                            <span>Fuel: {vehicle.fuel_type?.toUpperCase()}</span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono block">
                                            ₹{rates.per_day_inr || 2800}
                                        </span>
                                        <span className="text-[11px] text-stone-500">Base rate per day</span>
                                    </div>
                                </div>

                                {/* Spec Badges */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                                    <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 text-center space-y-1">
                                        <Users className="w-5 h-5 mx-auto text-amber-500" />
                                        <span className="text-xs font-bold text-stone-900 dark:text-white block">{vehicle.seats} Seats</span>
                                        <span className="text-[10px] text-stone-500">Passenger Capacity</span>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 text-center space-y-1">
                                        <Briefcase className="w-5 h-5 mx-auto text-amber-500" />
                                        <span className="text-xs font-bold text-stone-900 dark:text-white block">{vehicle.luggage_bags} Bags</span>
                                        <span className="text-[10px] text-stone-500">Boot Capacity</span>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 text-center space-y-1">
                                        <Wind className="w-5 h-5 mx-auto text-amber-500" />
                                        <span className="text-xs font-bold text-stone-900 dark:text-white block">{vehicle.ac ? 'AC Equipped' : 'Non-AC'}</span>
                                        <span className="text-[10px] text-stone-500">Climate Control</span>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 text-center space-y-1">
                                        <ShieldCheck className="w-5 h-5 mx-auto text-emerald-500" />
                                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">Verified Chauffeur</span>
                                        <span className="text-[10px] text-stone-500">Certified Driver</span>
                                    </div>
                                </div>

                                {/* Features & Amenities */}
                                {vehicle.features?.length > 0 && (
                                    <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                                        <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                                            Included Fleet Amenities
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {vehicle.features.map((f, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    {f.replace('_', ' ').toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                {vehicle.description && (
                                    <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                                        <h3 className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider">
                                            Vehicle Condition & Overview
                                        </h3>
                                        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                                            {vehicle.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* 3. TRANSPARENT RATE CARD & POLICIES */}
                            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
                                <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                                    <Calculator className="w-5 h-5 text-amber-500" />
                                    <span>Detailed Rate Card & Tariff Terms</span>
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                                    <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 flex items-center justify-between">
                                        <span className="text-stone-500">Per KM Tariff:</span>
                                        <strong className="text-stone-900 dark:text-white">₹{rates.per_km_inr}/km</strong>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 flex items-center justify-between">
                                        <span className="text-stone-500">Daily Min Run:</span>
                                        <strong className="text-stone-900 dark:text-white">{rates.daily_min_km} km/day</strong>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 flex items-center justify-between">
                                        <span className="text-stone-500">Driver Allowance:</span>
                                        <strong className="text-stone-900 dark:text-white">₹{rates.driver_allowance_per_day}/day</strong>
                                    </div>
                                    <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 flex items-center justify-between">
                                        <span className="text-stone-500">Night Halt Charges:</span>
                                        <strong className="text-stone-900 dark:text-white">₹{rates.night_halt_inr}/night</strong>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                                    <span className="font-bold block">Toll, Parking & Cancellation Rules:</span>
                                    <p>• {rates.toll_parking_rule || 'Tolls and parking paid directly at actuals.'}</p>
                                    <p>• {rates.cancellation_rule || 'Free cancellation up to 24 hours prior to pickup.'}</p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: LIVE PRICE ESTIMATOR & DIRECT INQUIRY */}
                        <div className="space-y-6">
                            {/* LIVE ESTIMATOR WIDGET */}
                            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border-2 border-amber-500/50 shadow-xl space-y-6 sticky top-24">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            Live Trip Cost Estimator
                                        </span>
                                        <h3 className="text-lg font-black text-stone-900 dark:text-white mt-0.5">
                                            Calculate Price
                                        </h3>
                                    </div>
                                    {estimateData?.fair_price_badge && (
                                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                            {estimateData.fair_price_badge}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                                            <span className="text-stone-700 dark:text-stone-300">Estimated Total Distance</span>
                                            <span className="text-amber-600 dark:text-amber-400 font-mono">{estKm} KM</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="100"
                                            max="2000"
                                            step="50"
                                            value={estKm}
                                            onChange={(e) => setEstKm(parseInt(e.target.value))}
                                            className="w-full accent-amber-500 cursor-pointer"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                                Trip Duration
                                            </label>
                                            <select
                                                value={estDays}
                                                onChange={(e) => {
                                                    const d = parseInt(e.target.value);
                                                    setEstDays(d);
                                                    setEstNights(Math.max(0, d - 1));
                                                }}
                                                className="w-full px-3 py-2 bg-stone-50 dark:bg-slate-950 border border-stone-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 10, 14].map((d) => (
                                                    <option key={d} value={d}>{d} Day(s)</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                                                Night Halts
                                            </label>
                                            <select
                                                value={estNights}
                                                onChange={(e) => setEstNights(parseInt(e.target.value))}
                                                className="w-full px-3 py-2 bg-stone-50 dark:bg-slate-950 border border-stone-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                                            >
                                                {[0, 1, 2, 3, 4, 5, 6, 7, 10, 14].map((n) => (
                                                    <option key={n} value={n}>{n} Night(s)</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Cost Breakdown */}
                                    {estimateData?.estimate && (
                                        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 space-y-2 text-xs font-mono">
                                            <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                                                <span>KM Cost ({estimateData.estimate.billable_km} km):</span>
                                                <span>₹{estimateData.estimate.km_cost}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                                                <span>Driver Allowance ({estDays}d):</span>
                                                <span>₹{estimateData.estimate.driver_allowance}</span>
                                            </div>
                                            {estNights > 0 && (
                                                <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                                                    <span>Night Halts ({estNights}n):</span>
                                                    <span>₹{estimateData.estimate.night_halt_charge}</span>
                                                </div>
                                            )}
                                            <div className="pt-2 border-t border-stone-200 dark:border-slate-800 flex items-center justify-between font-black text-sm text-stone-900 dark:text-white">
                                                <span>Estimated Total:</span>
                                                <span className="text-amber-600 dark:text-amber-400 text-base font-bold">
                                                    ₹{estimateData.estimate.estimated_total}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* In-App Direct Booking CTA */}
                                    <Link
                                        href={route('custom-trips.create')}
                                        className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span>Request Quote with this Fleet</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>

                                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-center">
                                        <Link
                                            href={route('vendor.profile', { slug: vehicle.vendor?.slug || vehicle.vendor_id })}
                                            className="text-xs text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 font-bold transition-colors inline-flex items-center gap-1.5"
                                        >
                                            <Store className="w-3.5 h-3.5" />
                                            <span>View {vehicle.vendor?.business_name}'s Storefront</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
