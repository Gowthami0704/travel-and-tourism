import React from 'react';
import { Link } from '@inertiajs/react';
import { MapPin, Sparkles, Utensils, Store, ArrowRight, Calendar } from 'lucide-react';
import { getImage, handleImageError } from '@/Utils/imageFallback';

export default function DistrictCard({ district }) {
    const imageUrl = getImage(district, 'district');

    // Region badge color
    const regionColors = {
        North: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        South: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        Kongu: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        Central: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        Coastal: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    };

    return (
        <Link
            href={`/district/${district.id}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-navy-card/90 border border-white/10 hover:border-gold/50 shadow-xl shadow-black/40 hover:shadow-2xl hover:shadow-gold/10 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
        >
            {/* Hero Image with Gradient Overlay */}
            <div className="relative h-52 w-full overflow-hidden bg-navy-lighter">
                <img
                    src={imageUrl}
                    alt={district.name}
                    onError={(e) => handleImageError(e, 'heritage')}
                    className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-transparent" />

                {/* Region & Best Season Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md border ${regionColors[district.region] || 'bg-white/10 text-white border-white/20'}`}>
                        {district.region} TN
                    </span>
                    {district.best_season && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/60 backdrop-blur-md text-gray-200 border border-white/10 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gold" />
                            {district.best_season}
                        </span>
                    )}
                </div>

                {/* Hidden Gem Alert Badge */}
                {district.hidden_gems_count > 0 && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                        <Sparkles className="w-3 h-3 text-gold" />
                        <span>{district.hidden_gems_count} Hidden {district.hidden_gems_count === 1 ? 'Gem' : 'Gems'}</span>
                    </div>
                )}
            </div>

            {/* Card Body */}
            <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-display text-xl font-bold text-white group-hover:text-gold transition-colors">
                            {district.name}
                        </h3>
                        <ArrowRight className="w-4 h-4 text-gold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
                        {district.description}
                    </p>
                </div>

                {/* Metrics Pill Counters */}
                <div className="pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-1.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="block font-bold text-white text-sm">
                            {district.places_count ?? 0}
                        </span>
                        <span className="text-[10px] text-gray-400">Places</span>
                    </div>

                    <div className="p-1.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="block font-bold text-gold text-sm">
                            {district.food_dishes_count ?? 0}
                        </span>
                        <span className="text-[10px] text-gray-400">Dishes</span>
                    </div>

                    <div className="p-1.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <span className="block font-bold text-cyan-400 text-sm">
                            {district.vendors_count ?? 0}
                        </span>
                        <span className="text-[10px] text-gray-400">Vendors</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
