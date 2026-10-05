import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import PlaceCard from '@/Components/Place/PlaceCard';
import VendorCard from '@/Components/Vendor/VendorCard';
import TripCostCalculator from '@/Components/Itinerary/TripCostCalculator';
import { 
    Compass, 
    Sparkles, 
    MapPin, 
    Calendar, 
    Utensils, 
    Award, 
    Car, 
    Clock, 
    ArrowLeft, 
    ChevronDown, 
    Calculator, 
    Train, 
    SlidersHorizontal,
    Check,
    Store
} from 'lucide-react';
import { getImage, handleImageError, cleanName } from '@/Utils/imageFallback';

export default function DistrictDetail({ district = {}, districtVendors = [], allDistricts = [], routes = [] }) {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const initialTab = urlParams.get('tab') === 'gems' ? 'gems' : (urlParams.get('tab') === 'vendors' ? 'vendors' : 'places');

    const [activeTab, setActiveTab] = useState(initialTab); // places, gems, food, vendors, travel, calculator
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPlaces, setSelectedPlaces] = useState([]);
    const [fromDistrictId, setFromDistrictId] = useState(allDistricts[0]?.id || '');
    const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
    const toolsRef = useRef(null);

    const heroImage = getImage(district, 'district');

    // Close tools dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (toolsRef.current && !toolsRef.current.contains(event.target)) {
                setToolsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Deduplicated places
    const allPlaces = useMemo(() => {
        const raw = district?.places || [];
        const seen = new Set();
        return raw.filter((p) => {
            const key = cleanName(p.name || '').toLowerCase().trim();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [district]);

    const regularPlaces = allPlaces.filter((p) => !p?.is_hidden_gem);
    const hiddenGems = allPlaces.filter((p) => p?.is_hidden_gem);

    const filteredPlaces = selectedCategory === 'all'
        ? regularPlaces
        : regularPlaces.filter((p) => (p?.category || '').toLowerCase() === selectedCategory.toLowerCase());

    // Deduplicated food dishes
    const foodDishes = useMemo(() => {
        const raw = district?.foodDishes || district?.food_dishes || [];
        const seen = new Set();
        return raw.filter((d) => {
            const key = cleanName(d.name || '').toLowerCase().trim();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [district]);

    // Unique verified vendors list
    const vendorsList = useMemo(() => {
        const raw = (districtVendors && districtVendors.length > 0) ? districtVendors : (district?.vendors || []);
        const seen = new Set();
        return raw.filter((v) => {
            if (!v?.id || seen.has(v.id)) return false;
            seen.add(v.id);
            return true;
        });
    }, [districtVendors, district]);

    // Multi-modal routes
    const relevantRoutes = useMemo(() => {
        const targetFrom = parseInt(fromDistrictId);
        const targetTo = parseInt(district?.id);
        if (!targetFrom || !targetTo) return [];

        let matched = (routes || []).filter(
            (r) => r?.from_district_id === targetFrom && r?.to_district_id === targetTo
        );
        if (matched.length === 0) {
            matched = (routes || []).filter(
                (r) => r?.to_district_id === targetFrom && r?.from_district_id === targetTo
            );
        }

        const seenModes = new Set();
        return matched.filter((r) => {
            const modeKey = (r?.mode || '').toLowerCase().trim();
            if (!modeKey || seenModes.has(modeKey)) return false;
            seenModes.add(modeKey);
            return true;
        });
    }, [routes, fromDistrictId, district?.id]);

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
            <Head title={`${district.name} District — Explore Places, Heritage & Stays | TN Explore`} />

            {/* Top District Hero Section with Clean Tokens */}
            <div className="relative overflow-hidden bg-[var(--card)] border-b border-[var(--border)] transition-colors duration-200">
                {/* Subtle Hero Photo Banner */}
                <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                    <img
                        src={heroImage}
                        alt={district.name}
                        onError={(e) => handleImageError(e, 'district')}
                        className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-[var(--card)]/60 to-transparent" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-8 z-10">
                    {/* Back Link */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] uppercase tracking-wider mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                        <span>All 38 Districts</span>
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-[var(--muted)] border border-[var(--border)]">
                                    District Hub
                                </span>
                                {district.best_season && (
                                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 dark:bg-stone-800 text-[var(--muted)] border border-[var(--border)] flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-[var(--verified)]" strokeWidth={1.5} />
                                        <span>Best Season: {district.best_season}</span>
                                    </span>
                                )}
                            </div>

                            <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--text)] tracking-tight">
                                {district.name}
                            </h1>

                            <p className="text-sm sm:text-base text-[var(--muted)] max-w-3xl mt-2 leading-relaxed">
                                {district.description || `Discover the cultural heritage, ancient Dravidian architecture, misty landscapes, and certified local guides of ${district.name}.`}
                            </p>
                        </div>

                        {/* Quick Stats Summary */}
                        <div className="flex items-center gap-2 sm:gap-4 bg-[var(--bg)] border border-[var(--border)] p-3 rounded-xl self-start md:self-auto">
                            <div className="text-center px-3 border-r border-[var(--border)]">
                                <span className="block font-bold text-lg text-[var(--text)]">{regularPlaces.length}</span>
                                <span className="text-[11px] text-[var(--muted)]">Places</span>
                            </div>
                            <div className="text-center px-3 border-r border-[var(--border)]">
                                <span className="block font-bold text-lg text-[var(--text)]">{hiddenGems.length}</span>
                                <span className="text-[11px] text-[var(--muted)]">Gems</span>
                            </div>
                            <div className="text-center px-3 border-r border-[var(--border)]">
                                <span className="block font-bold text-lg text-[var(--text)]">{foodDishes.length}</span>
                                <span className="text-[11px] text-[var(--muted)]">Food</span>
                            </div>
                            <div className="text-center px-3">
                                <span className="block font-bold text-lg text-[var(--text)]">{vendorsList.length}</span>
                                <span className="text-[11px] text-[var(--muted)]">Vendors</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clean Underlined Tab Bar */}
            <div className="sticky top-16 sm:top-20 z-30 bg-[var(--bg)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 sm:px-6 lg:px-8 transition-colors duration-200">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 py-0 overflow-x-auto scrollbar-none">
                    {/* Left: 4 Core Underlined Tabs */}
                    <nav className="flex items-center gap-6 sm:gap-8 flex-nowrap" aria-label="District Content Tabs">
                        {/* 1. Places */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('places')}
                            className={`py-4 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                                activeTab === 'places'
                                    ? 'border-[var(--primary)] text-[var(--text)] font-bold'
                                    : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                            }`}
                        >
                            <span>Places</span>
                            <span className="px-1.5 py-0.5 rounded-full text-xs bg-stone-200/70 dark:bg-stone-800 text-[var(--muted)]">
                                {regularPlaces.length}
                            </span>
                        </button>

                        {/* 2. Hidden Gems */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('gems')}
                            className={`py-4 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                                activeTab === 'gems'
                                    ? 'border-purple-600 text-purple-700 dark:text-purple-300 font-bold'
                                    : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-purple-500" strokeWidth={1.5} />
                            <span>Hidden Gems</span>
                            <span className="px-1.5 py-0.5 rounded-full text-xs bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                                {hiddenGems.length}
                            </span>
                        </button>

                        {/* 3. Food Trails */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('food')}
                            className={`py-4 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                                activeTab === 'food'
                                    ? 'border-[var(--verified)] text-[var(--verified)] font-bold'
                                    : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                            }`}
                        >
                            <span>Food Trails</span>
                            <span className="px-1.5 py-0.5 rounded-full text-xs bg-stone-200/70 dark:bg-stone-800 text-[var(--muted)]">
                                {foodDishes.length}
                            </span>
                        </button>

                        {/* 4. Local Vendors */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('vendors')}
                            className={`py-4 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                                activeTab === 'vendors'
                                    ? 'border-[var(--primary)] text-[var(--text)] font-bold'
                                    : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
                            }`}
                        >
                            <span>Local Vendors</span>
                            <span className="px-1.5 py-0.5 rounded-full text-xs bg-stone-200/70 dark:bg-stone-800 text-[var(--muted)]">
                                {vendorsList.length}
                            </span>
                        </button>
                    </nav>

                    {/* Right: Tools Button with Dropdown (Travel Comparison & Trip Budget Calculator) */}
                    <div className="relative py-2 shrink-0" ref={toolsRef}>
                        <button
                            type="button"
                            onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                activeTab === 'travel' || activeTab === 'calculator' || toolsDropdownOpen
                                    ? 'bg-[var(--card)] border-[var(--primary)] text-[var(--text)] shadow-sm'
                                    : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800'
                            }`}
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--primary)]" strokeWidth={1.5} />
                            <span>Tools</span>
                            {selectedPlaces.length > 0 && (
                                <span className="w-4 h-4 rounded-full bg-[var(--primary)] text-white text-[10px] flex items-center justify-center font-bold">
                                    {selectedPlaces.length}
                                </span>
                            )}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-180 ${toolsDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                        </button>

                        {toolsDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('travel');
                                        setToolsDropdownOpen(false);
                                    }}
                                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                        activeTab === 'travel'
                                            ? 'bg-stone-100 dark:bg-stone-800 text-[var(--text)] font-bold'
                                            : 'text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800'
                                    }`}
                                >
                                    <Train className="w-4 h-4 text-cyan-600 dark:text-cyan-400" strokeWidth={1.5} />
                                    <div>
                                        <div className="font-bold">Travel Comparison</div>
                                        <div className="text-[11px] text-[var(--muted)] font-normal">Train, bus & cab routes</div>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveTab('calculator');
                                        setToolsDropdownOpen(false);
                                    }}
                                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer mt-1 ${
                                        activeTab === 'calculator'
                                            ? 'bg-stone-100 dark:bg-stone-800 text-[var(--text)] font-bold'
                                            : 'text-[var(--text)] hover:bg-stone-100 dark:hover:bg-stone-800'
                                    }`}
                                >
                                    <Calculator className="w-4 h-4 text-[var(--verified)]" strokeWidth={1.5} />
                                    <div className="flex-1">
                                        <div className="font-bold flex items-center justify-between">
                                            <span>Trip Budget Calculator</span>
                                            {selectedPlaces.length > 0 && (
                                                <span className="text-[10px] text-[var(--verified)] font-bold">
                                                    ({selectedPlaces.length} selected)
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-[var(--muted)] font-normal">Estimate stay, fuel & tickets</div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Contents Container with 8px Consistent Spacing */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                {/* TAB 1: PLACES TO VISIT */}
                {activeTab === 'places' && (
                    <div className="space-y-6">
                        {/* Category Filter Pills (Neutral chips with subtle border, active maroon) */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {['all', 'temple', 'heritage', 'beach', 'hill_station', 'nature', 'museum'].map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer whitespace-nowrap border ${
                                        selectedCategory === cat
                                            ? 'bg-[var(--primary)] text-white dark:text-[#14110F] border-[var(--primary)]'
                                            : 'bg-[var(--card)] text-[var(--muted)] hover:text-[var(--text)] border-[var(--border)] hover:bg-stone-100 dark:hover:bg-stone-800'
                                    }`}
                                >
                                    {cat === 'all' ? 'All Places' : cat.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        {/* Responsive 4-Column Grid (4 images per line) */}
                        {filteredPlaces.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
                            <div className="p-12 text-center text-[var(--muted)] bg-[var(--card)] rounded-2xl border border-[var(--border)]">
                                No places found for the selected category.
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: HIDDEN GEMS */}
                {activeTab === 'gems' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider mb-1">
                                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                                <span>Curated Offbeat & Secret Trails</span>
                            </div>
                            <h2 className="font-serif text-2xl font-bold text-[var(--text)]">
                                {district.name}'s Best Kept Secrets
                            </h2>
                            <p className="text-xs text-[var(--muted)] mt-1 max-w-2xl leading-relaxed">
                                These locations are off the standard tourist radar. Preserved in their authentic form with minimal crowds, pristine nature, and historic serenity.
                            </p>
                        </div>

                        {hiddenGems.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
                            <div className="p-12 text-center text-[var(--muted)] bg-[var(--card)] rounded-2xl border border-[var(--border)]">
                                No hidden gems currently listed for this district.
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: FOOD TRAILS */}
                {activeTab === 'food' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                            <div>
                                <h2 className="font-serif text-2xl font-bold text-[var(--text)] flex items-center gap-2">
                                    <span>Authentic Food Trail — {district.name}</span>
                                </h2>
                                <p className="text-xs text-[var(--muted)] mt-1">
                                    Iconic regional dishes, traditional recipes, and verified local messes.
                                </p>
                            </div>
                            <Link
                                href={`/ai-guide?district=${encodeURIComponent(district.name)}&q=${encodeURIComponent('Famous food and top dishes in ' + district.name)}`}
                                className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white dark:text-[#14110F] font-bold text-xs flex items-center gap-2 self-start sm:self-auto hover:opacity-95 transition-opacity"
                            >
                                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                                <span>Ask TN Mitra Food Guide</span>
                            </Link>
                        </div>

                        {foodDishes.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                {foodDishes.map((dish) => {
                                    const img = getImage(dish, 'food');
                                    return (
                                        <article
                                            key={dish.id}
                                            className="rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-180"
                                        >
                                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100 dark:bg-stone-900">
                                                <img
                                                    src={img}
                                                    alt={dish.name}
                                                    onError={(e) => handleImageError(e, 'food')}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-md text-[10px] font-semibold text-white border border-white/20">
                                                    Specialty
                                                </div>
                                            </div>

                                            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="font-serif text-lg font-bold text-[var(--text)] mb-1.5">
                                                        {dish.name}
                                                    </h3>
                                                    <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed mb-3">
                                                        {dish.description}
                                                    </p>
                                                </div>

                                                <div className="pt-3 border-t border-[var(--border)]">
                                                    <span className="text-[11px] font-semibold text-[var(--text)] uppercase tracking-wider block mb-0.5">
                                                        Where to Try:
                                                    </span>
                                                    <p className="text-xs text-[var(--verified)] font-medium">
                                                        {dish.where_to_try || `${district.name} Heritage Messes`}
                                                    </p>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-[var(--muted)] bg-[var(--card)] rounded-2xl border border-[var(--border)]">
                                Curating food dishes for {district.name}.
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: LOCAL VENDORS */}
                {activeTab === 'vendors' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                            <h2 className="font-serif text-2xl font-bold text-[var(--text)]">
                                Certified Local Operators in {district.name}
                            </h2>
                            <p className="text-xs text-[var(--muted)] mt-1">
                                Tour operators, drivers, and guides with verified KYC documentation and transparent direct booking.
                            </p>
                        </div>

                        {vendorsList && vendorsList.length > 0 ? (
                            <div className="space-y-4">
                                {vendorsList.map((vendor) => (
                                    <VendorCard key={vendor.id} vendor={vendor} />
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-[var(--muted)] bg-[var(--card)] rounded-2xl border border-[var(--border)] space-y-3">
                                <Store className="w-10 h-10 text-[var(--muted)] mx-auto" strokeWidth={1.5} />
                                <h3 className="font-bold text-[var(--text)] text-base">No registered operators listed in {district.name} yet</h3>
                                <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                                    Are you a local tour operator, driver, or heritage guide in {district.name}? Partner with Tamil Nadu Tourism!
                                </p>
                                <Link
                                    href={route('vendor.register')}
                                    className="inline-block px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white dark:text-[#14110F] text-xs font-bold transition-opacity hover:opacity-95"
                                >
                                    Register as Partner in {district.name}
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 5: TRAVEL COMPARISON */}
                {activeTab === 'travel' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                            <h2 className="font-serif text-2xl font-bold text-[var(--text)] mb-2">
                                Travel Route & Transport Comparison
                            </h2>
                            <p className="text-xs text-[var(--muted)] mb-6">
                                Compare transport options connecting {district.name} from origin districts across Tamil Nadu.
                            </p>

                            {/* Origin District Picker */}
                            <div className="max-w-md mb-6">
                                <label className="block text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-1.5">
                                    Departing From:
                                </label>
                                <select
                                    value={fromDistrictId}
                                    onChange={(e) => setFromDistrictId(e.target.value)}
                                    className="w-full py-2.5 px-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus:outline-none focus:border-[var(--primary)]"
                                >
                                    {allDistricts.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            From {d.name} → To {district.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Route Cards */}
                            {relevantRoutes.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {relevantRoutes.map((r) => {
                                        const hours = Math.floor(r.duration_mins / 60);
                                        const mins = r.duration_mins % 60;
                                        return (
                                            <div
                                                key={r.id}
                                                className="p-5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex flex-col justify-between gap-4"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold text-[var(--muted)] uppercase">
                                                            {r.mode} Mode
                                                        </span>
                                                        <span className="px-2.5 py-1 rounded-md bg-stone-200/80 dark:bg-stone-800 text-[var(--text)] text-xs font-bold">
                                                            ₹{r.cost.toLocaleString('en-IN')}
                                                        </span>
                                                    </div>

                                                    <h3 className="font-serif text-base font-bold text-[var(--text)]">
                                                        {r.operator || 'State Transport'}
                                                    </h3>
                                                </div>

                                                <div className="space-y-1 text-xs text-[var(--muted)] pt-3 border-t border-[var(--border)]">
                                                    <div className="flex justify-between">
                                                        <span>Duration:</span>
                                                        <strong className="text-[var(--text)]">{hours}h {mins > 0 ? `${mins}m` : ''}</strong>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Distance:</span>
                                                        <strong className="text-[var(--text)]">{r.distance_km} km</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-center text-xs text-[var(--muted)]">
                                    Direct routes operate regularly via TNSTC / SETC buses and Southern Railways.
                                </div>
                            )}
                        </div>
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
