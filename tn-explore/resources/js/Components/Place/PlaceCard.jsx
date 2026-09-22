import React from 'react';
import { MapPin, ExternalLink, Sparkles, Plus, Check, Compass, Landmark, Mountain, Utensils, Hotel, Church, Trees, Waves } from 'lucide-react';
import { getImage, handleImageError, cleanName } from '@/Utils/imageFallback';

export default function PlaceCard({ place, isSelected, onToggleSelect }) {
    const imageUrl = getImage(place, 'place');
    const displayName = cleanName(place.name);

    // Intelligent context-aware theme & icon detector
    const getContextTheme = () => {
        const lower = displayName.toLowerCase() + ' ' + (place.category || '').toLowerCase() + ' ' + (place.type || '').toLowerCase();
        
        if (lower.includes('church') || lower.includes('matha') || lower.includes('cathedral') || lower.includes('shrine') || lower.includes('basilica')) {
            return {
                icon: Church,
                label: 'Church / Shrine',
                badgeStyle: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
                gradient: 'from-[#1a122e] via-[#241542] to-[#0f172a]',
                accentColor: 'text-violet-400',
                glow: 'shadow-violet-500/10'
            };
        }
        if (lower.includes('temple') || lower.includes('koil') || lower.includes('koyil') || lower.includes('amman') || lower.includes('eswaran') || lower.includes('perumal') || lower.includes('spiritual') || lower.includes('religious')) {
            return {
                icon: Landmark,
                label: 'Spiritual / Temple',
                badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                gradient: 'from-[#261c10] via-[#352514] to-[#0f172a]',
                accentColor: 'text-amber-400',
                glow: 'shadow-amber-500/10'
            };
        }
        if (lower.includes('falls') || lower.includes('waterfall') || lower.includes('beach') || lower.includes('sea') || lower.includes('lake') || lower.includes('river') || lower.includes('dam') || lower.includes('coastal')) {
            return {
                icon: Waves,
                label: 'Water & Scenic',
                badgeStyle: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
                gradient: 'from-[#0b212f] via-[#0f2c3d] to-[#0f172a]',
                accentColor: 'text-cyan-400',
                glow: 'shadow-cyan-500/10'
            };
        }
        if (lower.includes('museum') || lower.includes('fort') || lower.includes('palace') || lower.includes('kottai') || lower.includes('monument') || lower.includes('heritage') || lower.includes('historic')) {
            return {
                icon: Landmark,
                label: 'Heritage & Culture',
                badgeStyle: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
                gradient: 'from-[#291b10] via-[#3b2314] to-[#0f172a]',
                accentColor: 'text-orange-400',
                glow: 'shadow-orange-500/10'
            };
        }
        if (lower.includes('bird') || lower.includes('sanctuary') || lower.includes('wildlife') || lower.includes('forest') || lower.includes('hills') || lower.includes('peak') || lower.includes('park') || lower.includes('botanical') || lower.includes('nature')) {
            return {
                icon: Trees,
                label: 'Nature & Wildlife',
                badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                gradient: 'from-[#0d261e] via-[#13382c] to-[#0f172a]',
                accentColor: 'text-emerald-400',
                glow: 'shadow-emerald-500/10'
            };
        }
        if (lower.includes('food') || lower.includes('dish') || lower.includes('restaurant')) {
            return {
                icon: Utensils,
                label: 'Culinary Trail',
                badgeStyle: 'bg-red-500/20 text-red-300 border-red-500/30',
                gradient: 'from-[#291010] via-[#3b1414] to-[#0f172a]',
                accentColor: 'text-red-400',
                glow: 'shadow-red-500/10'
            };
        }
        if (lower.includes('hotel') || lower.includes('stay') || lower.includes('resort')) {
            return {
                icon: Hotel,
                label: 'Stay & Lodging',
                badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                gradient: 'from-[#101b2e] via-[#142642] to-[#0f172a]',
                accentColor: 'text-blue-400',
                glow: 'shadow-blue-500/10'
            };
        }

        return {
            icon: Compass,
            label: place.category || 'Tourism Point',
            badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            gradient: 'from-[#131b2e] via-[#1a233d] to-[#0f172a]',
            accentColor: 'text-purple-400',
            glow: 'shadow-purple-500/10'
        };
    };

    const theme = getContextTheme();
    const ThemeIcon = theme.icon;

    return (
        <div className={`relative flex flex-col overflow-hidden rounded-2xl bg-navy-card/90 border transition-all duration-300 hover:-translate-y-1 ${
            place.is_hidden_gem
                ? 'border-purple-500/40 hover:border-purple-400 shadow-lg shadow-purple-500/10'
                : 'border-white/10 hover:border-gold/40 shadow-lg shadow-black/40'
        }`}>
            {/* Header: Verified Photo OR Contextual Sleek Gradient Card */}
            {imageUrl ? (
                <div className="relative h-[200px] w-full overflow-hidden bg-navy-lighter rounded-t-2xl group">
                    <img
                        src={imageUrl}
                        alt={displayName}
                        onError={handleImageError}
                        className="h-[200px] w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 rounded-t-2xl"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/30 pointer-events-none" />

                    {/* Hidden CSS fallback if image fails at runtime */}
                    <div className={`css-placeholder hidden absolute inset-0 bg-gradient-to-br ${theme.gradient} flex-col items-center justify-center p-4 text-center`}>
                        <ThemeIcon className={`w-8 h-8 ${theme.accentColor} mb-2`} />
                        <span className="text-xs font-semibold text-gray-300 mb-1">{displayName}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">📍 Verified Landmark</span>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${theme.badgeStyle}`}>
                            {theme.label}
                        </span>

                        {place.is_hidden_gem && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-gold" />
                                HIDDEN GEM
                            </span>
                        )}
                    </div>

                    {/* Google Maps Button */}
                    <a
                        href={
                            place.maps_url ||
                            (place.latitude && place.longitude
                                ? `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayName + ' ' + (place.district || '') + ' Tamil Nadu')}`)
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-[11px] text-white hover:bg-gold hover:text-black font-medium flex items-center gap-1 transition-colors z-10"
                        title="Open in Google Maps"
                    >
                        <MapPin className="w-3 h-3" />
                        <span>Maps</span>
                    </a>
                </div>
            ) : (
                /* Sleek Dark CSS Gradient Card with Context Icon */
                <div className={`relative h-[200px] w-full bg-gradient-to-br ${theme.gradient} border-b border-white/10 flex flex-col items-center justify-center p-4 text-center rounded-t-2xl`}>
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2 shadow-inner">
                        <ThemeIcon className={`w-7 h-7 ${theme.accentColor}`} />
                    </div>
                    <span className="text-sm font-bold text-white line-clamp-1 px-4">{displayName}</span>
                    <span className={`text-[10px] ${theme.accentColor} font-semibold uppercase tracking-widest mt-1`}>
                        📍 Verified Landmark
                    </span>

                    {/* Top Badges for CSS placeholder */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <span className={`px-2.5 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-wider backdrop-blur-md border ${theme.badgeStyle}`}>
                            {theme.label}
                        </span>

                        {place.is_hidden_gem && (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wider bg-purple-600/80 text-purple-200 border border-purple-400/40 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 text-gold" />
                                GEM
                            </span>
                        )}
                    </div>

                    {/* Google Maps Button */}
                    <a
                        href={
                            place.maps_url ||
                            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayName + ' ' + (place.district || '') + ' Tamil Nadu')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-[11px] text-white hover:bg-gold hover:text-black font-medium flex items-center gap-1 transition-colors z-10"
                        title="Open in Google Maps"
                    >
                        <MapPin className="w-3 h-3" />
                        <span>Maps</span>
                    </a>
                </div>
            )}

            {/* Content Body */}
            <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                    <h4 className="font-display text-lg font-bold text-white mb-2 leading-snug">
                        {displayName}
                    </h4>

                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-4">
                        {place.description ? place.description.replace(/[\s—-]+coverage\s*slot\s*\d+/gi, '') : `Authentic tourist destination in ${place.district || 'Tamil Nadu'}.`}
                    </p>
                </div>

                {/* Action Controls */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    {place.wiki_url || (imageUrl && imageUrl.includes('wikipedia')) ? (
                        <a
                            href={place.wiki_url || `https://en.wikipedia.org/wiki/${encodeURIComponent(displayName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gold hover:text-gold-light font-medium flex items-center gap-1"
                        >
                            <span>Wikipedia</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    ) : (
                        <span className="text-[11px] text-gray-500">📍 {place.district || 'Tamil Nadu'}</span>
                    )}

                    {onToggleSelect && (
                        <button
                            type="button"
                            onClick={() => onToggleSelect(place)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isSelected
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-white/5 text-gray-300 hover:bg-gold hover:text-black border border-white/10'
                            }`}
                        >
                            {isSelected ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>In Calculator</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ Trip Budget</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
