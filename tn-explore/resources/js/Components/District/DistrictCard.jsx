import React from 'react';
import { Link } from '@inertiajs/react';
import { MapPin, Sparkles, Utensils, Store, ArrowRight, Calendar, Landmark } from 'lucide-react';
import { getImage, handleImageError } from '@/Utils/imageFallback';

export default function DistrictCard({ district }) {
    const imageUrl = getImage(district, 'district');

    // Region badge styling with high contrast in light & dark mode
    const regionStyles = {
        North: 'bg-blue-100/90 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-700',
        South: 'bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700',
        Kongu: 'bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
        Central: 'bg-rose-100/90 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-700',
        Coastal: 'bg-teal-100/90 dark:bg-teal-950/80 text-teal-900 dark:text-teal-200 border-teal-300 dark:border-teal-700',
    };

    // Extract top 3 places
    const topPlaces = district.places ? district.places.slice(0, 3) : [];

    return (
        <Link
            href={`/district/${district.id}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-stone-900 border border-[#EBE3D0] dark:border-stone-800 hover:border-turmeric-500 dark:hover:border-amber-500 shadow-sm hover:shadow-xl hover:shadow-turmeric-500/10 dark:hover:shadow-amber-500/5 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
        >
            {/* Hero Image with Gradient Overlay */}
            <div className="relative h-52 w-full overflow-hidden bg-amber-50 dark:bg-stone-800">
                <img
                    src={imageUrl}
                    alt={district.name}
                    onError={(e) => handleImageError(e, 'heritage')}
                    className="h-full w-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent" />

                {/* District Header Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md border shadow-xs bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700">
                        Tamil Nadu
                    </span>
                    {district.best_season && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 dark:bg-stone-900/90 backdrop-blur-md text-stone-900 dark:text-stone-100 border border-white/60 dark:border-stone-700 shadow-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            {district.best_season}
                        </span>
                    )}
                </div>

                {/* District Name overlay on image base */}
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                        <h3 className="font-serif text-2xl font-black text-white drop-shadow-md group-hover:text-amber-200 transition-colors">
                            {district.name}
                        </h3>
                    </div>
                    {district.hidden_gems_count > 0 && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-peacock-700 dark:bg-peacock-600 text-[10px] font-extrabold text-white shadow-md border border-peacock-500/40">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            <span>{district.hidden_gems_count} Hidden Gem{district.hidden_gems_count > 1 ? 's' : ''}</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Card Body */}
            <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
                <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                    {district.description || 'Explore rich Dravidian temple architecture, natural reserves, and culinary delicacies.'}
                </p>

                {/* Top 3 Places Preview */}
                {topPlaces.length > 0 && (
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">Top Attractions:</span>
                        <div className="flex flex-wrap gap-1">
                            {topPlaces.map((p, idx) => (
                                <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 truncate max-w-[180px]">
                                    • {p.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Metrics Pill Counters */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div className="p-1.5 rounded-xl bg-amber-50/70 dark:bg-stone-800/80 border border-amber-100 dark:border-stone-700/80">
                        <span className="block font-bold text-stone-800 dark:text-stone-100 text-sm">
                            {district.places_count ?? (district.places?.length || 12)}
                        </span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Places</span>
                    </div>

                    <div className="p-1.5 rounded-xl bg-amber-50/70 dark:bg-stone-800/80 border border-amber-100 dark:border-stone-700/80">
                        <span className="block font-bold text-turmeric-700 dark:text-amber-400 text-sm">
                            {district.food_dishes_count ?? (district.food_dishes?.length || 8)}
                        </span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Dishes</span>
                    </div>

                    <div className="p-1.5 rounded-xl bg-amber-50/70 dark:bg-stone-800/80 border border-amber-100 dark:border-stone-700/80">
                        <span className="block font-bold text-peacock-700 dark:text-teal-400 text-sm">
                            {district.vendors_count ?? (district.vendors?.length || 4)}
                        </span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">Verified</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
