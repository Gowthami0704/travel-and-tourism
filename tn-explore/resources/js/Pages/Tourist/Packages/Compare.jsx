import React from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Package,
    ShieldCheck,
    Calendar,
    Users,
    Clock,
    Check,
    X,
    ArrowRight,
    Star
} from 'lucide-react';

export default function PackageCompare({ packages = [] }) {
    return (
        <MainLayout>
            <Head title="Compare Tour Packages Side-by-Side — TN Explore" />

            <div className="min-h-screen bg-[#FFFDF7] dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="pb-4 border-b border-stone-200 dark:border-stone-800">
                        <h1 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-2.5">
                            <Package className="w-6 h-6 text-amber-500" />
                            <span>Side-by-Side Tour Package Comparison</span>
                        </h1>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                            Compare duration, price per person, inclusions, itinerary stops, and operator verification.
                        </p>
                    </div>

                    {packages.length > 0 ? (
                        <div className="overflow-x-auto rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead className="bg-stone-50 dark:bg-stone-800 text-stone-500 uppercase text-[10px] tracking-wider font-bold border-b border-stone-200 dark:border-stone-700">
                                    <tr>
                                        <th className="p-4 w-48">Feature / Metric</th>
                                        {packages.map((p) => (
                                            <th key={p.id} className="p-4 text-stone-900 dark:text-white">
                                                {p.title}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    <tr>
                                        <td className="p-4 font-bold text-stone-500">Starting Price</td>
                                        {packages.map((p) => (
                                            <td key={p.id} className="p-4 font-black text-amber-600 dark:text-amber-400 text-base font-mono">
                                                ₹{p.price_per_person || p.price}/person
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-bold text-stone-500">Duration</td>
                                        {packages.map((p) => (
                                            <td key={p.id} className="p-4 font-bold text-stone-900 dark:text-white">
                                                {p.duration_days || 3} Days / {p.duration_nights || 2} Nights
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-bold text-stone-500">Verified Operator</td>
                                        {packages.map((p) => (
                                            <td key={p.id} className="p-4 text-stone-700 dark:text-stone-300">
                                                {p.vendor?.business_name} (Trust: {Math.round((p.vendor?.trust_score || 0.92) * 100)}%)
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-bold text-stone-500">Next Departure</td>
                                        {packages.map((p) => (
                                            <td key={p.id} className="p-4 font-mono text-xs">
                                                {p.package_departures?.[0]?.departure_date || 'On Request'}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td className="p-4 font-bold text-stone-500">Action</td>
                                        {packages.map((p) => (
                                            <td key={p.id} className="p-4">
                                                <Link
                                                    href={route('packages.show', { id: p.id })}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
                                                >
                                                    <span>View Package</span>
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-xs text-stone-500 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-3">
                            <Package className="w-8 h-8 mx-auto text-stone-400" />
                            <p>Select packages from the catalogue to compare them side-by-side.</p>
                            <Link
                                href={route('packages.index')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold"
                            >
                                Browse Tour Packages
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
