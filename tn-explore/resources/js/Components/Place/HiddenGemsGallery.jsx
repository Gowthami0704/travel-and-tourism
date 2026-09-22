import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, ExternalLink, Search, Filter, Compass, Landmark, Mountain } from 'lucide-react';
import { getImage, handleImageError, cleanName } from '@/Utils/imageFallback';

export default function HiddenGemsGallery({ initialData = null, limit = 16 }) {
    const [places, setPlaces] = useState(initialData || []);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('All');
    const [loading, setLoading] = useState(!initialData);

    useEffect(() => {
        if (!initialData) {
            fetch('/data/tourism_data.json')
                .then((res) => res.json())
                .then((data) => {
                    setPlaces(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Failed to load tourism data:', err);
                    setLoading(false);
                });
        }
    }, [initialData]);

    const districts = ['All', ...Array.from(new Set(places.map((p) => p.district).filter(Boolean))).sort()];

    const filteredPlaces = places.filter((item) => {
        const matchesDistrict = selectedDistrict === 'All' || item.district === selectedDistrict;
        const matchesSearch = !searchQuery || 
            item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags?.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesDistrict && matchesSearch;
    }).slice(0, limit);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search 2,500 places, food, gems..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-navy-card/90 border border-white/10 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    <Filter className="w-4 h-4 text-gold shrink-0" />
                    <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="bg-navy-card/90 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-400"
                    >
                        {districts.map((d) => (
                            <option key={d} value={d} className="bg-navy text-white">
                                {d === 'All' ? 'All 38 Districts' : d}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPlaces.map((item) => {
                    const img = getImage(item, 'place');
                    const displayName = cleanName(item.name);

                    return (
                        <div
                            key={item.id}
                            className="group relative flex flex-col rounded-2xl overflow-hidden bg-navy-card/90 border border-purple-500/30 hover:border-purple-400 shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Image Header */}
                            <div className="relative w-full h-[200px] overflow-hidden bg-gradient-to-br from-[#131b2e] via-[#1a233d] to-[#0f172a] rounded-t-2xl flex flex-col items-center justify-center p-4 text-center">
                                {/* Base Fallback */}
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-1.5 shadow-inner">
                                    <Sparkles className="w-5 h-5 text-gold" />
                                </div>
                                <span className="text-xs font-bold text-white line-clamp-1 px-3">{displayName}</span>
                                <span className="text-[10px] text-purple-400/90 font-medium uppercase tracking-wider mt-1">
                                    📍 Verified Offbeat Gem
                                </span>

                                {/* Image with error handler */}
                                {img && (
                                    <img
                                        src={img}
                                        alt={displayName}
                                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                        className="absolute inset-0 w-full h-[200px] object-cover transition-transform duration-500 group-hover:scale-105 rounded-t-2xl"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-black/30 pointer-events-none" />

                                {/* Top Badges */}
                                <div className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-900/80 backdrop-blur-md border border-purple-400/40 text-purple-200 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-gold" />
                                        {item.category || item.type || 'Hidden Gem'}
                                    </span>
                                </div>

                                {/* District Badge */}
                                <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white pointer-events-none">
                                    📍 {item.district}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-display font-bold text-base text-white group-hover:text-gold transition-colors mb-1">
                                        {displayName}
                                    </h3>
                                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-3">
                                        {item.description ? item.description.replace(/[\s—-]+coverage\s*slot\s*\d+/gi, '') : `Offbeat destination in ${item.district}.`}
                                    </p>
                                </div>

                                {/* Footer links */}
                                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                                    <span className="text-gray-500 font-mono text-[11px]">
                                        {item.id}
                                    </span>

                                    {item.maps_url && (
                                        <a
                                            href={item.maps_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gold hover:text-gold-light font-medium flex items-center gap-1 transition-colors"
                                        >
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span>View Map</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
