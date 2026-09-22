import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import AdventureBackground from '@/Components/Themes/AdventureBackground';
import PlaceCard from '@/Components/Place/PlaceCard';
import VendorCard from '@/Components/Vendor/VendorCard';
import TripCostCalculator from '@/Components/Itinerary/TripCostCalculator';
import { Compass, Sparkles, MapPin, Calendar, Utensils, Award, Car, Clock, DollarSign, ExternalLink, ArrowLeft, Plus, Check, Filter } from 'lucide-react';
import { getImage, handleImageError } from '@/Utils/imageFallback';

export default function DistrictDetail({ district = {}, allDistricts = [], routes = [] }) {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const initialTab = urlParams.get('tab') === 'gems' ? 'gems' : 'places';

    const [activeTab, setActiveTab] = useState(initialTab); // places, gems, food, travel, vendors, calculator
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const [fromDistrictId, setFromDistrictId] = useState(allDistricts[0]?.id || '');

    const heroImage = getImage(district, 'district');

    // Places categorized
    const allPlaces = district?.places || [];
    const regularPlaces = allPlaces.filter((p) => !p?.is_hidden_gem);
    const hiddenGems = allPlaces.filter((p) => p?.is_hidden_gem);

    const filteredPlaces = selectedCategory === 'all'
        ? regularPlaces
        : regularPlaces.filter((p) => (p?.category || '').toLowerCase() === selectedCategory.toLowerCase());

    // Food dishes
    const foodDishes = district?.foodDishes || district?.food_dishes || [];

    // Filter routes for travel comparison
    const relevantRoutes = (routes || []).filter(
        (r) => (r?.from_district_id === parseInt(fromDistrictId) && r?.to_district_id === district?.id) ||
               (r?.to_district_id === parseInt(fromDistrictId) && r?.from_district_id === district?.id)
    );

    const toggleSelectPlace = (place) => {
        if (!place) return;
        if (selectedPlaces.some((p) => p.id === place.id)) {
            setSelectedPlaces(selectedPlaces.filter((p) => p.id !== place.id));
        } else {
            setSelectedPlaces([...selectedPlaces, place]);
        }
    };

    return (
        <MainLayout>
            <Head title={`${district.name} District — Explore Places, Food & Stays | TN Explore`} />

            {/* Top District Hero Banner with Animated Adventure Background */}
            <div className="relative min-h-[420px] flex items-end overflow-hidden border-b border-white/10 px-4 sm:px-6 lg:px-8 py-12">
                <AdventureBackground />

                {/* Background Hero Image with Dark Gradient Blend */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={heroImage}
                        alt={district.name}
                        onError={(e) => handleImageError(e, 'heritage')}
                        className="w-full h-full object-cover object-center opacity-35"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-[#0A0E1A]/80 to-transparent" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto w-full">
                    {/* Back Link */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-gold uppercase tracking-wider mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>All 38 Districts</span>
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-forest/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                                    {district.region} Tamil Nadu
                                </span>
                                {district.best_season && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/60 text-gray-200 border border-white/10 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-gold" />
                                        Best Season: {district.best_season}
                                    </span>
                                )}
                            </div>

                            <h1 className="font-display font-black text-4xl sm:text-6xl text-white tracking-tight">
                                {district.name}
                            </h1>

                            <p className="text-sm sm:text-base text-gray-300 max-w-3xl mt-3 leading-relaxed">
                                {district.description}
                            </p>
                        </div>

                        {/* Quick Stats Pill */}
                        <div className="flex items-center gap-3 bg-navy-card/90 border border-white/10 p-3 rounded-2xl backdrop-blur-md self-start md:self-auto">
                            <div className="text-center px-3 border-r border-white/10">
                                <span className="block font-display font-bold text-xl text-white">{allPlaces.length}</span>
                                <span className="text-[10px] text-gray-400">Places</span>
                            </div>
                            <div className="text-center px-3 border-r border-white/10">
                                <span className="block font-display font-bold text-xl text-purple-400">{hiddenGems.length}</span>
                                <span className="text-[10px] text-gray-400">Gems</span>
                            </div>
                            <div className="text-center px-3 border-r border-white/10">
                                <span className="block font-display font-bold text-xl text-gold">{foodDishes.length}</span>
                                <span className="text-[10px] text-gray-400">Dishes</span>
                            </div>
                            <div className="text-center px-3">
                                <span className="block font-display font-bold text-xl text-cyan-400">{district.vendors?.length || 0}</span>
                                <span className="text-[10px] text-gray-400">Vendors</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="sticky top-20 z-30 bg-[#0A0E1A]/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
                    <button
                        type="button"
                        onClick={() => setActiveTab('places')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'places'
                                ? 'bg-gold text-[#0A0E1A] shadow-md shadow-gold/20'
                                : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <span>🏛️ Places to Visit</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 font-mono">
                            {regularPlaces.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('gems')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'gems'
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                : 'bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20'
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5 text-gold" />
                        <span>Hidden Gems Mode</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-900/60 font-mono">
                            {hiddenGems.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('food')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'food'
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <span>🍲 Food Trail</span>
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/20 font-mono">
                            {foodDishes.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('travel')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'travel'
                                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                                : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <span>🚆 Travel Comparison</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('vendors')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'vendors'
                                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                                : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <span>🛍️ Local Vendors ({district.vendors?.length || 0})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('calculator')}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ml-auto ${
                            activeTab === 'calculator'
                                ? 'bg-gradient-to-r from-gold via-gold-light to-gold text-[#0A0E1A] shadow-md shadow-gold/25'
                                : 'bg-forest/60 text-emerald-300 border border-emerald-500/40 hover:bg-forest'
                        }`}
                    >
                        <span>💰 Trip Budget Calculator</span>
                        {selectedPlaces.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-950 font-bold text-gold">
                                {selectedPlaces.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Tab Contents */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* TAB 1: PLACES */}
                {activeTab === 'places' && (
                    <div className="space-y-6">
                        {/* Category filter pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1 mr-1">
                                <Filter className="w-3.5 h-3.5" />
                                Filter:
                            </span>
                            {['all', 'temple', 'heritage', 'beach', 'hill_station', 'nature', 'museum'].map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                                        selectedCategory === cat
                                            ? 'bg-gold text-black'
                                            : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    {cat === 'all' ? 'All Categories' : cat.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        {filteredPlaces.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredPlaces.map((place) => (
                                    <PlaceCard
                                        key={place.id}
                                        place={place}
                                        isSelected={selectedPlaces.some((p) => p.id === place.id)}
                                        onToggleSelect={toggleSelectPlace}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-400 bg-white/[0.02] rounded-2xl border border-white/5">
                                No places found for the selected category.
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: HIDDEN GEMS */}
                {activeTab === 'gems' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-purple-950/40 border border-purple-500/30">
                            <div className="flex items-center gap-2 text-gold font-bold text-sm mb-1">
                                <Sparkles className="w-4 h-4" />
                                <span>Curated Offbeat & Secret Trails</span>
                            </div>
                            <h3 className="font-display text-2xl font-bold text-white">
                                {district.name}'s Best Kept Secrets
                            </h3>
                            <p className="text-xs text-gray-300 mt-1 max-w-2xl leading-relaxed">
                                These locations are off the standard tourist radar. Preserved in their authentic form with minimal crowds, pristine nature, and historic serenity.
                            </p>
                        </div>

                        {hiddenGems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {hiddenGems.map((gem) => (
                                    <PlaceCard
                                        key={gem.id}
                                        place={gem}
                                        isSelected={selectedPlaces.some((p) => p.id === gem.id)}
                                        onToggleSelect={toggleSelectPlace}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-400 bg-white/[0.02] rounded-2xl border border-white/5">
                                No hidden gems flagged yet for this district.
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: FOOD TRAILS */}
                {activeTab === 'food' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-display text-2xl font-bold text-white">
                                    Authentic Food Trail — {district.name}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Iconic regional dishes, famous heritage messes, and street food specialties.
                                </p>
                            </div>
                        </div>

                        {foodDishes.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {foodDishes.map((dish) => {
                                    const img = getImage(dish, 'food');
                                    return (
                                        <div
                                            key={dish.id}
                                            className="rounded-2xl bg-navy-card/90 border border-white/10 hover:border-gold/40 shadow-xl overflow-hidden flex flex-col justify-between group"
                                        >
                                            <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-[#2a1318] via-[#1a1220] to-[#0f172a] border-b border-white/10 flex flex-col items-center justify-center p-4 text-center">
                                                {/* Foundational Food Placeholder */}
                                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-1.5 shadow-inner">
                                                    <Utensils className="w-5 h-5 text-red-400" />
                                                </div>
                                                <span className="text-[11px] text-red-300 font-medium uppercase tracking-wider">
                                                    🍲 Authentic Culinary Trail
                                                </span>

                                                {/* Image layer on top */}
                                                {img && (
                                                    <img
                                                        src={img}
                                                        alt={dish.name}
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        loading="lazy"
                                                    />
                                                )}
                                                {img && (
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent pointer-events-none" />
                                                )}
                                                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/40 text-[10px] font-bold text-red-300 pointer-events-none">
                                                    🍲 Regional Specialty
                                                </div>
                                            </div>

                                            <div className="p-5 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="font-display text-lg font-bold text-white mb-1.5">
                                                        {dish.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-3">
                                                        {dish.description}
                                                    </p>
                                                </div>

                                                <div className="pt-3 border-t border-white/5">
                                                    <span className="block text-[11px] font-bold text-gold uppercase tracking-wider mb-1">
                                                        📍 Where to Try:
                                                    </span>
                                                    <p className="text-xs text-emerald-300 font-medium">
                                                        {dish.where_to_try}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-400 bg-white/[0.02] rounded-2xl border border-white/5">
                                Food dishes are being curated for this district.
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: TRAVEL COMPARISON */}
                {activeTab === 'travel' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-navy-card/90 border border-white/10">
                            <h3 className="font-display text-2xl font-bold text-white mb-2">
                                Multi-Modal Travel Cost & Time Comparison
                            </h3>
                            <p className="text-xs text-gray-400 mb-6">
                                Compare fastest vs cheapest transport options connecting {district.name} from another district (Static curated routes data).
                            </p>

                            {/* Origin District Picker */}
                            <div className="max-w-md mb-6">
                                <label className="block text-xs font-bold text-gold uppercase tracking-wider mb-1.5">
                                    Departing From (Origin District):
                                </label>
                                <select
                                    value={fromDistrictId}
                                    onChange={(e) => setFromDistrictId(e.target.value)}
                                    className="w-full py-2.5 px-3 bg-[#080C16] border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-gold"
                                >
                                    {allDistricts.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            From {d.name} → To {district.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Comparison Table / Cards */}
                            {relevantRoutes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {relevantRoutes.map((r) => {
                                        const hours = Math.floor(r.duration_mins / 60);
                                        const mins = r.duration_mins % 60;
                                        return (
                                            <div
                                                key={r.id}
                                                className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-4"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-2xl">
                                                            {r.mode === 'Train' ? '🚆' : r.mode === 'Bus' ? '🚌' : r.mode === 'Cab' ? '🚗' : '🏍️'}
                                                        </span>
                                                        <span className="px-2.5 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold">
                                                            ₹{r.cost.toLocaleString('en-IN')}
                                                        </span>
                                                    </div>

                                                    <h4 className="font-display text-base font-bold text-white">
                                                        {r.mode} Mode
                                                    </h4>
                                                    <p className="text-xs text-emerald-300 font-semibold mt-0.5">
                                                        {r.operator || 'State Transport'}
                                                    </p>
                                                </div>

                                                <div className="space-y-1 text-xs text-gray-400 pt-3 border-t border-white/5">
                                                    <div className="flex justify-between">
                                                        <span>Duration:</span>
                                                        <strong className="text-white">{hours}h {mins > 0 ? `${mins}m` : ''}</strong>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Distance:</span>
                                                        <strong className="text-white">{r.distance_km} km</strong>
                                                    </div>
                                                    {r.notes && (
                                                        <p className="text-[11px] text-gray-400 mt-2 italic">
                                                            "{r.notes}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-gray-400">
                                    No direct static route seeded yet between these two districts. Default State Transport (TNSTC / SETC) buses operate hourly.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 5: VENDORS */}
                {activeTab === 'vendors' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-display text-2xl font-bold text-white">
                                    Verified Local Vendors & Stays in {district.name}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    All providers are vetted with Isolation Forest AI Trust Scoring for safe reservations.
                                </p>
                            </div>
                        </div>

                        {district.vendors && district.vendors.length > 0 ? (
                            <div className="space-y-5">
                                {district.vendors.map((vendor) => (
                                    <VendorCard key={vendor.id} vendor={vendor} />
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-400 bg-white/[0.02] rounded-2xl border border-white/5 space-y-3">
                                <Award className="w-10 h-10 text-gray-500 mx-auto" />
                                <h4 className="font-bold text-white text-base">No active vendors currently in this district</h4>
                                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                                    Are you a local business owner or guide in {district.name}? Register as a vendor partner!
                                </p>
                                <Link
                                    href={route('register')}
                                    className="inline-block px-4 py-2 rounded-xl bg-gold text-black text-xs font-bold"
                                >
                                    Register as Vendor
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 6: TRIP BUDGET CALCULATOR */}
                {activeTab === 'calculator' && (
                    <div className="space-y-6">
                        <TripCostCalculator
                            district={district}
                            selectedPlaces={selectedPlaces}
                            onRemovePlace={toggleSelectPlace}
                        />
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
