import React, { useState } from 'react';
import { MapPin, Heart, Plus, Check, Eye, Compass, Info } from 'lucide-react';
import { getImage, handleImageError, cleanName } from '@/Utils/imageFallback';

export default function PlaceCard({ place = {}, isSelected = false, onToggleSelect, onSelectPlace }) {
    const [isSaved, setIsSaved] = useState(false);
    const imageUrl = getImage(place, 'place');
    const displayName = cleanName(place.name || 'Tourist Place');

    // Factual description & area metadata
    const description = place.short_description || place.description || `Historic landmark and cultural destination in ${place.area || place.district?.name || 'Tamil Nadu'}.`;
    const area = place.area || (place.district?.name ? `${place.district.name} Area` : 'Tamil Nadu');
    const bestTime = place.best_time || place.district?.best_season || 'Oct–Mar';
    const categoryName = (place.category || (place.is_hidden_gem ? 'Hidden Gem' : 'Heritage')).replace(/_/g, ' ');

    // Color dot mapping for category chips (neutral chip background with a clean colored dot)
    const getDotColor = () => {
        const cat = (place.category || '').toLowerCase();
        if (place.is_hidden_gem) return 'bg-purple-500';
        if (cat.includes('temple') || cat.includes('spiritual')) return 'bg-amber-600';
        if (cat.includes('nature') || cat.includes('hill') || cat.includes('falls')) return 'bg-[var(--verified)]';
        if (cat.includes('beach') || cat.includes('water')) return 'bg-sky-500';
        if (cat.includes('food') || cat.includes('culinary')) return 'bg-rose-500';
        return 'bg-[var(--primary)]';
    };

    const mapsUrl = place.maps_url || (place.latitude && place.longitude
        ? `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayName + ' ' + (place.district?.name || place.district_name || '') + ' Tamil Nadu')}`);

    return (
        <article className="group relative flex flex-col rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-hidden transition-all duration-180 hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0 motion-reduce:transition-none">
            {/* 16:10 Photo Container */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-stone-900">
                <img
                    src={imageUrl}
                    alt={displayName}
                    onError={handleImageError}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-180 ease-out motion-reduce:group-hover:scale-100"
                />

                {/* Heart / Save button in top corner */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsSaved(!isSaved);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
                    aria-label={isSaved ? 'Remove from saved' : 'Save place'}
                    title={isSaved ? 'Saved' : 'Save place'}
                >
                    <Heart
                        className={`w-4 h-4 transition-colors ${isSaved ? 'text-rose-400 fill-rose-400' : 'text-white'}`}
                        strokeWidth={1.5}
                    />
                </button>
            </div>

            {/* Content Body */}
            <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                <div>
                    {/* Category Chip (Neutral chip with small colored dot) */}
                    <div className="mb-2.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-stone-100 dark:bg-stone-800/80 text-[var(--muted)] border border-[var(--border)] capitalize">
                            <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
                            <span>{categoryName}</span>
                        </span>
                    </div>

                    {/* Title (max 2 lines) */}
                    <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text)] line-clamp-2 leading-snug mb-1.5">
                        {displayName}
                    </h3>

                    {/* Unique Description (max 2 lines) */}
                    <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed mb-3">
                        {description}
                    </p>
                </div>

                <div>
                    {/* Meta Line: <area> · <best time> */}
                    <div className="flex items-center text-xs text-[var(--muted)] font-medium mb-4 pb-3 border-b border-[var(--border)]">
                        <span className="truncate">{area}</span>
                        <span className="mx-1.5 text-[var(--border)]">•</span>
                        <span className="shrink-0">{bestTime}</span>
                    </div>

                    {/* Action Buttons: View Details (Primary), Add to trip (Secondary), Maps icon button */}
                    <div className="flex items-center gap-2">
                        {/* 1. View Details (Primary Action) */}
                        <a
                            href={place.wiki_url || mapsUrl}
                            target={place.wiki_url ? '_blank' : '_self'}
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-2 rounded-xl bg-[var(--primary)] hover:opacity-95 text-white dark:text-[#14110F] text-xs font-bold text-center transition-opacity flex items-center justify-center gap-1.5 shadow-sm"
                        >
                            <span>View details</span>
                        </a>

                        {/* 2. Add to trip (Secondary Action) */}
                        <button
                            type="button"
                            onClick={() => onToggleSelect && onToggleSelect(place)}
                            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                                isSelected
                                    ? 'bg-[var(--verified)] text-white border-[var(--verified)]'
                                    : 'border-[var(--border)] bg-transparent text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800'
                            }`}
                            title={isSelected ? 'Added to trip' : 'Add to trip'}
                        >
                            {isSelected ? (
                                <>
                                    <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    <span className="hidden sm:inline">Added</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    <span>Add to trip</span>
                                </>
                            )}
                        </button>

                        {/* 3. Small Maps Icon Button */}
                        <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center transition-colors shrink-0"
                            title="Open location in Google Maps"
                            aria-label="Google Maps"
                        >
                            <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </a>
                    </div>
                </div>
            </div>
        </article>
    );
}
