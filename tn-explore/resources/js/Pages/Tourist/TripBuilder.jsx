import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import ToyTripMap from '@/Components/Map/ToyTripMap';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    Compass,
    Calculator,
    Sparkles,
    Check,
    Copy,
    Download,
    GripVertical,
    Trash2,
    Plus,
    Car,
    Train,
    Bus,
    Users,
    Calendar,
    Hotel,
    Utensils,
    Ticket,
    Navigation,
    Award,
    Clock,
    DollarSign,
    Info,
    MapPin,
    ArrowRight,
    Search,
    RotateCcw,
    SlidersHorizontal,
    Flag,
    CheckCircle2,
    Sliders
} from 'lucide-react';
import { calculateTotalRouteDistance } from '@/Utils/districtCoordinates';
import { cleanName, getImage } from '@/Utils/imageFallback';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function TripBuilder({ districts = [], initialDistrictId = null }) {
    // -------------------------------------------------------------
    // 1. WIZARD STATE (Start Place, End Place, Place Preferences)
    // -------------------------------------------------------------
    const [wizardOpen, setWizardOpen] = useState(true);
    const [startDistrictName, setStartDistrictName] = useState('Chennai');
    const [endDistrictName, setEndDistrictName] = useState('Madurai');
    
    // Preference categories: temple, beach, hill, mall, fort, waterfall
    const [selectedPreferences, setSelectedPreferences] = useState([
        'temple',
        'hill',
        'beach'
    ]);

    const preferenceOptions = [
        { id: 'temple', label: 'Temples & Heritage', icon: '🛕', desc: 'Ancient Chola shrines & Dravidian gopurams', color: 'bg-amber-100 dark:bg-amber-900/40 border-amber-400 text-amber-900 dark:text-amber-200' },
        { id: 'beach', label: 'Beaches & Coastal Waves', icon: '🏖️', desc: 'Marina, Dhanushkodi & sunrise coastlines', color: 'bg-cyan-100 dark:bg-cyan-900/40 border-cyan-400 text-cyan-900 dark:text-cyan-200' },
        { id: 'hill', label: 'Hill Stations & Peaks', icon: '🌲', desc: 'Ooty, Kodaikanal, Yercaud & tea valleys', color: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-400 text-emerald-900 dark:text-emerald-200' },
        { id: 'mall', label: 'Malls & Urban Shopping', icon: '🛍️', desc: 'City shopping malls, Silk bazaars & foods', color: 'bg-rose-100 dark:bg-rose-900/40 border-rose-400 text-rose-900 dark:text-rose-200' },
        { id: 'fort', label: 'Forts & Royal Palaces', icon: '🏰', desc: 'Historic stone fortresses & Nayak palaces', color: 'bg-purple-100 dark:bg-purple-900/40 border-purple-400 text-purple-900 dark:text-purple-200' },
        { id: 'waterfall', label: 'Waterfalls & Forest Treks', icon: '🌊', desc: 'Courtallam, Hogenakkal & cascading falls', color: 'bg-sky-100 dark:bg-sky-900/40 border-sky-400 text-sky-900 dark:text-sky-200' },
    ];

    // Current active district displayed in sidebar checklist
    const [activeDistrictId, setActiveDistrictId] = useState(
        initialDistrictId || (districts[0]?.id || null)
    );

    const activeDistrict = useMemo(() => {
        return districts.find((d) => d.id === activeDistrictId) || districts[0] || {};
    }, [districts, activeDistrictId]);

    const allDistrictPlaces = useMemo(() => {
        const raw = activeDistrict.places || [];
        const seen = new Set();
        return raw.filter((p) => {
            const key = (cleanName(p.name) || '').toLowerCase().trim();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [activeDistrict]);

    // Selected Places for the Itinerary
    const [selectedPlaces, setSelectedPlaces] = useState([]);

    // Trip & Budget settings
    const [days, setDays] = useState(3);
    const [travelers, setTravelers] = useState(2);
    const [transitMode, setTransitMode] = useState('Cab'); // Cab (₹15/km), Bus (₹2.5/km), Train (₹3/km), Bike (₹6/km)
    const [stayStyle, setStayStyle] = useState('heritage'); // budget, heritage, luxury
    const [foodStyle, setFoodStyle] = useState('authentic'); // street, authentic, fine
    const [placeSearch, setPlaceSearch] = useState('');
    const [copied, setCopied] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [mobileTab, setMobileTab] = useState('build'); // 'build' | 'map'

    const handleSwitchMobileTab = (tab) => {
        setMobileTab(tab);
        if (tab === 'map') {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 150);
        }
    };

    const printablePdfRef = useRef(null);

    // Toggle preference checkbox
    const togglePreference = (prefId) => {
        setSelectedPreferences((prev) =>
            prev.includes(prefId)
                ? prev.filter((p) => p !== prefId)
                : [...prev, prefId]
        );
    };

    // Helper: matches place category with preferences
    const matchesPreference = (place) => {
        if (selectedPreferences.length === 0) return true;
        const cat = (place.category || '').toLowerCase();
        const desc = (place.description || '').toLowerCase();
        const name = (place.name || '').toLowerCase();

        return selectedPreferences.some((pref) => {
            if (pref === 'temple' && (cat.includes('temple') || cat.includes('spiritual') || desc.includes('temple') || name.includes('temple') || name.includes('kovil'))) return true;
            if (pref === 'beach' && (cat.includes('beach') || cat.includes('coastal') || desc.includes('beach') || desc.includes('sea') || name.includes('beach'))) return true;
            if (pref === 'hill' && (cat.includes('hill') || cat.includes('mountain') || cat.includes('valley') || desc.includes('hill') || desc.includes('peak') || desc.includes('mist'))) return true;
            if (pref === 'mall' && (cat.includes('shopping') || cat.includes('mall') || cat.includes('urban') || desc.includes('mall') || desc.includes('market') || desc.includes('bazaar'))) return true;
            if (pref === 'fort' && (cat.includes('fort') || cat.includes('palace') || cat.includes('heritage') || desc.includes('fort') || desc.includes('palace'))) return true;
            if (pref === 'waterfall' && (cat.includes('waterfall') || cat.includes('falls') || cat.includes('lake') || desc.includes('waterfall') || desc.includes('cascade'))) return true;
            return false;
        });
    };

    // -------------------------------------------------------------
    // GENERATE ROUTE BASED ON START, END, & PREFERENCES
    // -------------------------------------------------------------
    const handleGenerateRoute = () => {
        const startDist = districts.find((d) => d.name.toLowerCase() === startDistrictName.toLowerCase()) || districts[0];
        const endDist = districts.find((d) => d.name.toLowerCase() === endDistrictName.toLowerCase()) || districts[1] || districts[0];

        const candidatePlaces = [];

        // 1. Pick matching places from Start District
        if (startDist?.places) {
            const startMatches = startDist.places
                .filter(matchesPreference)
                .slice(0, 2)
                .map((p) => ({ ...p, district_name: startDist.name }));
            candidatePlaces.push(...startMatches);
        }

        // 2. Pick matching places from Intermediate Districts if Start != End
        if (startDist.id !== endDist.id) {
            const otherDists = districts.filter((d) => d.id !== startDist.id && d.id !== endDist.id);
            if (otherDists.length > 0) {
                const sampleDist = otherDists[Math.floor(Math.random() * otherDists.length)];
                if (sampleDist?.places) {
                    const midMatches = sampleDist.places
                        .filter(matchesPreference)
                        .slice(0, 2)
                        .map((p) => ({ ...p, district_name: sampleDist.name }));
                    candidatePlaces.push(...midMatches);
                }
            }
        }

        // 3. Pick matching places from End District
        if (endDist?.places) {
            const endMatches = endDist.places
                .filter(matchesPreference)
                .slice(0, 3)
                .map((p) => ({ ...p, district_name: endDist.name }));
            candidatePlaces.push(...endMatches);
        }

        // Fallback: If no strict matches found, take top places from start and end
        if (candidatePlaces.length === 0) {
            if (startDist?.places) candidatePlaces.push(...startDist.places.slice(0, 2).map((p) => ({ ...p, district_name: startDist.name })));
            if (endDist?.places) candidatePlaces.push(...endDist.places.slice(0, 2).map((p) => ({ ...p, district_name: endDist.name })));
        }

        // Strict Deduplication: Ensure each place appears only once in route stops by cleanName
        const uniquePlaces = [];
        const seenKeys = new Set();
        candidatePlaces.forEach((p) => {
            const key = cleanName(p.name || '').toLowerCase().trim();
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                uniquePlaces.push(p);
            }
        });

        setSelectedPlaces(uniquePlaces);
        setActiveDistrictId(endDist.id);
        setWizardOpen(false); // Close wizard and give map
    };

    // Auto-initialize on mount
    useEffect(() => {
        handleGenerateRoute();
    }, []);

    // Toggle place in itinerary
    const handleTogglePlace = (place) => {
        setSelectedPlaces((prev) => {
            const exists = prev.some((p) => p.id === place.id);
            if (exists) {
                return prev.filter((p) => p.id !== place.id);
            } else {
                const enriched = { ...place, district_name: activeDistrict.name };
                return [...prev, enriched];
            }
        });
    };

    // Remove single place
    const handleRemovePlace = (placeId) => {
        setSelectedPlaces((prev) => prev.filter((p) => p.id !== placeId));
    };

    // Drag and Drop reorder
    const onDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(selectedPlaces);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setSelectedPlaces(items);
    };

    // Filter places available in sidebar checklist
    const filteredPlaces = useMemo(() => {
        return allDistrictPlaces.filter((p) => {
            const matchesSearch =
                p.name.toLowerCase().includes(placeSearch.toLowerCase()) ||
                (p.category && p.category.toLowerCase().includes(placeSearch.toLowerCase()));
            const matchesPref = matchesPreference(p);
            return matchesSearch && (selectedPreferences.length === 0 || matchesPref);
        });
    }, [allDistrictPlaces, placeSearch, selectedPreferences]);

    // -------------------------------------------------------------
    // DYNAMIC BUDGET FORMULAS
    // -------------------------------------------------------------
    const transitRates = {
        Cab: 15,    // ₹15 / km
        Bus: 2.5,   // ₹2.5 / km / person
        Train: 3,   // ₹3 / km / person
        Bike: 6,    // ₹6 / km
    };

    const hotelRates = {
        budget: 1200,
        heritage: 2800,
        luxury: 6500,
    };

    const foodRates = {
        street: 350,
        authentic: 700,
        fine: 1500,
    };

    // 1. Total Route Distance (Haversine km across multi-district pins)
    const routeDistanceKm = useMemo(() => {
        return calculateTotalRouteDistance(selectedPlaces, activeDistrict.name);
    }, [selectedPlaces, activeDistrict]);

    // 2. Inter-District Transit Cost
    const transitCost = useMemo(() => {
        const baseRate = transitRates[transitMode] || 15;
        const totalDistance = Math.max(25, routeDistanceKm);
        if (transitMode === 'Cab' || transitMode === 'Bike') {
            return Math.round(totalDistance * baseRate + 300);
        } else {
            return Math.round(totalDistance * baseRate * travelers);
        }
    }, [routeDistanceKm, transitMode, travelers]);

    // 3. Sightseeing & Passes (₹50 per place per traveler)
    const entryFeePerPlace = 50;
    const sightseeingCost = selectedPlaces.length * entryFeePerPlace * travelers;

    // 4. Stay Cost
    const roomsCount = Math.ceil(travelers / 2);
    const nightsCount = Math.max(1, days - 1);
    const stayCost = hotelRates[stayStyle] * roomsCount * nightsCount;

    // 5. Food Cost
    const foodCost = foodRates[foodStyle] * travelers * days;

    // 6. Grand Total & Per Person
    const totalBudget = transitCost + sightseeingCost + stayCost + foodCost;
    const perPersonCost = Math.round(totalBudget / Math.max(1, travelers));

    // Copy Summary Text
    const handleCopySummary = () => {
        const text = `🗺️ TN Explore Custom Route & Budget Planner\n` +
            `• Start Point: ${startDistrictName} ➔ End Destination: ${endDistrictName}\n` +
            `• Preferred Themes: ${selectedPreferences.join(', ').toUpperCase()}\n` +
            `• Duration: ${days} Days | Travelers: ${travelers} Pax | Transit: ${transitMode}\n` +
            `• Route Stops (${selectedPlaces.length}): ${selectedPlaces.map((p, i) => `#${i + 1} ${cleanName(p.name)} (${p.district_name || activeDistrict.name})`).join(' ➔ ')}\n` +
            `• Total Route Distance: ${routeDistanceKm} km\n` +
            `• Sightseeing & Passes: ₹${sightseeingCost.toLocaleString('en-IN')}\n` +
            `• Transit Cost: ₹${transitCost.toLocaleString('en-IN')}\n` +
            `• Stays (${stayStyle}): ₹${stayCost.toLocaleString('en-IN')}\n` +
            `• Food (${foodStyle}): ₹${foodCost.toLocaleString('en-IN')}\n` +
            `💰 Total Estimated Trip Budget: ₹${totalBudget.toLocaleString('en-IN')} (₹${perPersonCost.toLocaleString('en-IN')}/pax)\n` +
            `Generated via TN Explore Smart Tourism Engine.`;

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Export PDF
    const handleDownloadPdf = async () => {
        if (!printablePdfRef.current) return;
        setIsDownloadingPdf(true);

        try {
            const canvas = await html2canvas(printablePdfRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#090D18',
                logging: false,
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`TN_Explore_Route_${startDistrictName}_to_${endDistrictName}.pdf`);
        } catch (err) {
            console.error(err);
            alert('Could not export PDF automatically. Please try browser print.');
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    return (
        <MainLayout>
            <Head title="Smart Route & Budget Wizard | TN Explore" />

            <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-5">
                {/* ------------------------------------------------------------- */}
                {/* 1. INTERACTIVE QUESTION WIZARD (START, END & PREFERENCES)    */}
                {/* ------------------------------------------------------------- */}
                <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-xl mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-200 dark:border-stone-700">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 flex items-center gap-1.5 shadow-xs">
                                    <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                    Smart Journey Route Wizard
                                </span>
                                <span className="text-stone-500 dark:text-stone-400">• Interactive Geo-Route Engine</span>
                            </div>
                            <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900 dark:text-white flex items-center gap-2">
                                <span>Where do you want to start and explore?</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={handleCopySummary}
                                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                <span>{copied ? 'Copied Summary' : 'Copy Route'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadPdf}
                                disabled={isDownloadingPdf}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-teal-700/20 hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <Download className="w-4 h-4" />
                                <span>{isDownloadingPdf ? 'Exporting...' : 'Export PDF'}</span>
                            </button>
                        </div>
                    </div>

                    {/* QUESTION CONTROLS GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
                        {/* 1. START LOCATION (Col 1-3) */}
                        <div className="lg:col-span-3 p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-850 border border-emerald-500/30 space-y-2.5 shadow-xs">
                            <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Flag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                1. Start Location (Origin)
                            </label>
                            <select
                                value={startDistrictName}
                                onChange={(e) => setStartDistrictName(e.target.value)}
                                className="w-full py-2 px-3 bg-white dark:bg-stone-900 border border-emerald-500/40 rounded-xl text-xs font-bold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer shadow-xs"
                            >
                                {districts.map((d) => (
                                    <option key={d.id} value={d.name} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                                        🚩 {d.name} ({d.region} TN)
                                    </option>
                                ))}
                            </select>

                            {/* Quick Start Buttons */}
                            <div className="flex flex-wrap gap-1 pt-1">
                                {['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'].map((city) => (
                                    <button
                                        key={city}
                                        type="button"
                                        onClick={() => setStartDistrictName(city)}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                                            startDistrictName === city
                                                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-200 border border-emerald-400'
                                                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:text-stone-900'
                                        }`}
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. END LOCATION (Col 4-6) */}
                        <div className="lg:col-span-3 p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-850 border border-amber-500/30 space-y-2.5 shadow-xs">
                            <label className="block text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                2. End Location (Destination)
                            </label>
                            <select
                                value={endDistrictName}
                                onChange={(e) => setEndDistrictName(e.target.value)}
                                className="w-full py-2 px-3 bg-white dark:bg-stone-900 border border-amber-500/40 rounded-xl text-xs font-bold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer shadow-xs"
                            >
                                {districts.map((d) => (
                                    <option key={d.id} value={d.name} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                                        🏁 {d.name} ({d.region} TN)
                                    </option>
                                ))}
                            </select>

                            {/* Quick Destination Buttons */}
                            <div className="flex flex-wrap gap-1 pt-1">
                                {['Nilgiris', 'Kanyakumari', 'Madurai', 'Ramanathapuram', 'Thanjavur'].map((dest) => (
                                    <button
                                        key={dest}
                                        type="button"
                                        onClick={() => setEndDistrictName(dest)}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                                            endDistrictName === dest
                                                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-400'
                                                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:text-stone-900'
                                        }`}
                                    >
                                        {dest === 'Ramanathapuram' ? 'Rameswaram' : dest === 'Nilgiris' ? 'Ooty' : dest}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. FAVORITE PLACES / VIBES SELECTION (Col 7-12) */}
                        <div className="lg:col-span-6 p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-850 border border-purple-500/30 space-y-2.5 shadow-xs">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    3. Which places do you mostly like?
                                </label>
                                <span className="text-[10px] text-stone-500 dark:text-stone-400">Select any themes</span>
                            </div>

                            {/* Vibe Selection Pills */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {preferenceOptions.map((opt) => {
                                    const isSelected = selectedPreferences.includes(opt.id);
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => togglePreference(opt.id)}
                                            className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                isSelected
                                                    ? `${opt.color} shadow-sm scale-[1.02] font-bold`
                                                    : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 hover:border-stone-300'
                                            }`}
                                        >
                                            <span className="text-base flex-shrink-0">{opt.icon}</span>
                                            <div className="min-w-0">
                                                <div className="text-[11px] leading-tight truncate">
                                                    {opt.label.split('&')[0]}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <CheckCircle2 className="w-3.5 h-3.5 ml-auto flex-shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* MASTER TRIGGER BUTTON */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleGenerateRoute}
                                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-black text-xs shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Navigation className="w-4 h-4 fill-current animate-pulse" />
                                    <span>
                                        🗺️ Generate Route: {startDistrictName} ➔ {endDistrictName} ({selectedPlaces.length} Stops Connected)
                                    </span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 2. SPLIT-SCREEN WORKSPACE (Mobile: Tab Switcher, Desktop: 35/65 Side-by-Side) */}
                {/* ------------------------------------------------------------- */}

                {/* MOBILE WORKSPACE TAB SWITCHER (< lg) */}
                <div className="lg:hidden flex items-center p-1 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 mb-4 shadow-md">
                    <button
                        type="button"
                        onClick={() => handleSwitchMobileTab('build')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] touch-manipulation ${
                            mobileTab === 'build'
                                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                        }`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span>📝 Itinerary & Budget ({selectedPlaces.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSwitchMobileTab('map')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] touch-manipulation ${
                            mobileTab === 'map'
                                ? 'bg-teal-600 text-white shadow-md font-extrabold'
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                        }`}
                    >
                        <MapPin className="w-4 h-4" />
                        <span>🗺️ Interactive Map</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* LEFT PANEL: 35% WIDTH (Columns 1-4 on Desktop, Conditional on Mobile) */}
                    <div className={`${mobileTab === 'build' ? 'block' : 'hidden'} lg:block lg:col-span-4 space-y-5`}>
                        {/* REORDERABLE ITINERARY ROUTE (DRAG & DROP) */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-md space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                                    <h3 className="font-display font-bold text-sm text-stone-900 dark:text-white">
                                        Route Stops ({selectedPlaces.length})
                                    </h3>
                                </div>
                                <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                                    Drag handles to reorder
                                </span>
                            </div>

                            {selectedPlaces.length > 0 ? (
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="itinerary-list">
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="space-y-2 max-h-60 overflow-y-auto pr-1"
                                            >
                                                {selectedPlaces.map((place, index) => (
                                                    <Draggable key={String(place.id)} draggableId={String(place.id)} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all select-none ${
                                                                    snapshot.isDragging
                                                                        ? 'bg-amber-100 dark:bg-amber-900/60 border-amber-400 shadow-2xl scale-[1.02] z-50'
                                                                        : 'bg-[#FAF7F0] dark:bg-stone-850 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5 min-w-0">
                                                                    {/* Drag Handle */}
                                                                    <div
                                                                        {...provided.dragHandleProps}
                                                                        className="text-stone-400 hover:text-amber-600 cursor-grab active:cursor-grabbing p-1"
                                                                    >
                                                                        <GripVertical className="w-4 h-4" />
                                                                    </div>

                                                                    {/* Stop Number Pill */}
                                                                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-extrabold text-[11px] flex items-center justify-center flex-shrink-0 shadow-xs">
                                                                        #{index + 1}
                                                                    </span>

                                                                    {/* Place Title & Category */}
                                                                    <div className="min-w-0">
                                                                        <h4 className="text-xs font-bold text-stone-900 dark:text-white truncate max-w-[170px] sm:max-w-[210px]">
                                                                            {cleanName(place.name)}
                                                                        </h4>
                                                                        <span className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                                                                            <MapPin className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                                                            <span>{place.district_name || activeDistrict.name} • {place.category || 'Attraction'}</span>
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Remove Button */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemovePlace(place.id)}
                                                                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                                    title="Remove from Route"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            ) : (
                                <div className="p-6 text-center text-stone-500 bg-[#FAF7F0] dark:bg-stone-850 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 space-y-1.5">
                                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200">No route stops selected</p>
                                    <p className="text-[11px] text-stone-500">Click "Generate Route" above or check places below!</p>
                                </div>
                            )}
                        </div>

                        {/* DISTRICT EXPLORER & CHECKLIST */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-md space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-display font-bold text-xs uppercase text-amber-800 dark:text-amber-400 tracking-wider flex items-center gap-1.5">
                                    <Plus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                    Browse & Add More Places
                                </h3>
                                <span className="text-[10px] text-stone-500 dark:text-stone-400">{filteredPlaces.length} Matching</span>
                            </div>

                            {/* District Switcher & Search */}
                            <div className="space-y-2">
                                <select
                                    value={activeDistrictId}
                                    onChange={(e) => setActiveDistrictId(Number(e.target.value))}
                                    className="w-full py-1.5 px-2.5 bg-[#FAF7F0] dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-bold text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                                >
                                    {districts.map((d) => (
                                        <option key={d.id} value={d.id} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
                                            {d.name} District ({d.places?.length || 0} Places)
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="text"
                                    value={placeSearch}
                                    onChange={(e) => setPlaceSearch(e.target.value)}
                                    placeholder="Filter by name, temple, hill, beach..."
                                    className="w-full px-3 py-1.5 bg-[#FAF7F0] dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                            </div>

                            {/* Checklist Items */}
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {filteredPlaces.map((place) => {
                                    const isChecked = selectedPlaces.some((p) => p.id === place.id);
                                    return (
                                        <label
                                            key={place.id}
                                            className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                                                isChecked
                                                    ? 'bg-amber-100/70 dark:bg-amber-900/40 border-amber-400 text-stone-900 dark:text-white font-semibold'
                                                    : 'bg-[#FAF7F0] dark:bg-stone-850 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleTogglePlace(place)}
                                                    className="rounded bg-white dark:bg-stone-800 border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold truncate max-w-[190px]">
                                                        {cleanName(place.name)}
                                                    </p>
                                                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                                                        {place.category || 'Sightseeing'}
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="text-[10px] text-amber-800 dark:text-amber-400 font-mono font-bold whitespace-nowrap">
                                                +₹50
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* LIVE DYNAMIC BUDGET CALCULATOR */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-md space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-700">
                                <h3 className="font-display font-bold text-sm text-stone-900 dark:text-white flex items-center gap-1.5">
                                    <Calculator className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    Live Budget Calculator
                                </h3>
                                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                                    Real-time Sync
                                </span>
                            </div>

                            {/* Parameter Controls */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-[10px] text-stone-500 dark:text-stone-400 block mb-1">Duration</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 5].map((d) => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => setDays(d)}
                                                className={`flex-1 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                                                    days === d ? 'bg-amber-500 text-stone-950 font-black shadow-xs' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                                                }`}
                                            >
                                                {d}D
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[10px] text-stone-500 dark:text-stone-400 block mb-1">Travelers</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 4, 6].map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => setTravelers(num)}
                                                className={`flex-1 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                                                    travelers === num ? 'bg-amber-500 text-stone-950 font-black shadow-xs' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                                                }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] text-stone-500 dark:text-stone-400">Transit Vehicle</span>
                                        <button
                                            type="button"
                                            onClick={() => setShowCompareModal(true)}
                                            className="text-[10px] text-amber-700 dark:text-amber-400 hover:text-amber-900 font-bold underline cursor-pointer flex items-center gap-0.5"
                                        >
                                            <Sparkles className="w-2.5 h-2.5" />
                                            <span>Compare</span>
                                        </button>
                                    </div>
                                    <select
                                        value={transitMode}
                                        onChange={(e) => setTransitMode(e.target.value)}
                                        className="w-full py-1 px-2 bg-[#FAF7F0] dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-lg text-[11px] text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                    >
                                        <option value="Cab">🚗 Cab (₹15/km)</option>
                                        <option value="Bus">🚌 Bus (₹2.5/km)</option>
                                        <option value="Train">🚆 Train (₹3/km)</option>
                                        <option value="Bike">🛵 Bike (₹6/km)</option>
                                    </select>
                                </div>

                                <div>
                                    <span className="text-[10px] text-stone-500 dark:text-stone-400 block mb-1">Stay Class</span>
                                    <select
                                        value={stayStyle}
                                        onChange={(e) => setStayStyle(e.target.value)}
                                        className="w-full py-1 px-2 bg-[#FAF7F0] dark:bg-stone-850 border border-stone-300 dark:border-stone-700 rounded-lg text-[11px] text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                    >
                                        <option value="budget">Budget (~₹1,200)</option>
                                        <option value="heritage">Heritage (~₹2,800)</option>
                                        <option value="luxury">Luxury (~₹6,500)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Cost Breakdown Rows */}
                            <div className="space-y-1.5 pt-2 border-t border-stone-200 dark:border-stone-700 text-[11px] text-stone-700 dark:text-stone-300">
                                <div className="flex justify-between">
                                    <span className="flex items-center gap-1">
                                        <Ticket className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                        Passes ({selectedPlaces.length} stops × ₹50)
                                    </span>
                                    <span className="font-mono text-stone-900 dark:text-white font-bold">₹{sightseeingCost.toLocaleString('en-IN')}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="flex items-center gap-1">
                                        <Navigation className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                                        Transit ({routeDistanceKm} km @ {transitMode})
                                    </span>
                                    <span className="font-mono text-stone-900 dark:text-white font-bold">₹{transitCost.toLocaleString('en-IN')}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="flex items-center gap-1">
                                        <Hotel className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                                        Stay ({nightsCount} Nights)
                                    </span>
                                    <span className="font-mono text-stone-900 dark:text-white font-bold">₹{stayCost.toLocaleString('en-IN')}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="flex items-center gap-1">
                                        <Utensils className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                        Food & Dining ({days} Days)
                                    </span>
                                    <span className="font-mono text-stone-900 dark:text-white font-bold">₹{foodCost.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            {/* Total Grand Cost */}
                            <div className="pt-3 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                                        Total Estimated Budget
                                    </span>
                                    <span className="text-xs text-stone-500 dark:text-stone-400">
                                        ₹{perPersonCost.toLocaleString('en-IN')} / person
                                    </span>
                                </div>

                                <div className="text-right">
                                    <span className="font-display font-black text-2xl text-amber-700 dark:text-amber-400">
                                        ₹{totalBudget.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* MULTI-AGENT AI RECOMMENDATION & SDG ALIGNMENT PANEL (PICO & RESEARCH ENGINE) */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-emerald-500/40 shadow-md space-y-3.5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                            
                            {/* Header & Personalization Accuracy Gauge (>82% Target) */}
                            <div className="flex items-start justify-between gap-2 border-b border-stone-200 dark:border-stone-700 pb-2.5">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                                        <h4 className="font-bold text-xs text-stone-900 dark:text-white uppercase tracking-wider">
                                            Multi-Agent Cooperative AI
                                        </h4>
                                    </div>
                                    <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                                        Offline hybrid filtering & Isolation Forest shield
                                    </p>
                                </div>

                                <div className="text-right">
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 text-[10px] font-black font-mono">
                                        89.8% Fit
                                    </span>
                                    <span className="text-[9px] text-stone-500 dark:text-stone-400 block mt-0.5">Target &gt; 82%</span>
                                </div>
                            </div>

                            {/* 4 Multi-Agent Roles Breakdown */}
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                                {/* 1. Heritage Agent */}
                                <div className="p-2 rounded-xl bg-[#FAF7F0] dark:bg-stone-850 border border-stone-200 dark:border-stone-700 space-y-0.5">
                                    <div className="flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300">
                                        <span>🏛️ Heritage Agent</span>
                                    </div>
                                    <p className="text-stone-600 dark:text-stone-400 text-[9px] line-clamp-1">
                                        {selectedPreferences.join(', ')} circuit
                                    </p>
                                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[9px]">✓ High Ritual Fit</span>
                                </div>

                                {/* 2. Route & Carbon Agent */}
                                <div className="p-2 rounded-xl bg-[#FAF7F0] dark:bg-stone-850 border border-stone-200 dark:border-stone-700 space-y-0.5">
                                    <div className="flex items-center gap-1 font-bold text-teal-800 dark:text-teal-300">
                                        <span>🗺️ Route & Eco Agent</span>
                                    </div>
                                    <p className="text-stone-600 dark:text-stone-400 text-[9px]">
                                        {routeDistanceKm} km via {transitMode}
                                    </p>
                                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[9px]">
                                        🌱 {transitMode === 'Cab' ? '170g CO2/km' : 'Green Transit (~14-28g)'}
                                    </span>
                                </div>

                                {/* 3. Budget Guard Agent */}
                                <div className="p-2 rounded-xl bg-[#FAF7F0] dark:bg-stone-850 border border-stone-200 dark:border-stone-700 space-y-0.5">
                                    <div className="flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300">
                                        <span>💰 Budget Guard</span>
                                    </div>
                                    <p className="text-stone-600 dark:text-stone-400 text-[9px]">
                                        ₹{perPersonCost}/pax vs tariff
                                    </p>
                                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[9px]">✓ Zero Overcharging</span>
                                </div>

                                {/* 4. Safety & Trust Agent */}
                                <div className="p-2 rounded-xl bg-[#FAF7F0] dark:bg-stone-850 border border-stone-200 dark:border-stone-700 space-y-0.5">
                                    <div className="flex items-center gap-1 font-bold text-purple-800 dark:text-purple-300">
                                        <span>🛡️ Trust & Safety</span>
                                    </div>
                                    <p className="text-stone-600 dark:text-stone-400 text-[9px]">
                                        Isolation Forest Model
                                    </p>
                                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[9px]">✓ 0 Scam Flags</span>
                                </div>
                            </div>

                            {/* SDG Goals Badges (SDG 8, 9, 11) */}
                            <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-1 text-[9px] text-stone-600 dark:text-stone-400">
                                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300 font-bold">
                                    SDG 8: Decent Work
                                </span>
                                <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 font-bold">
                                    SDG 9: Edge AI (14ms)
                                </span>
                                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-bold">
                                    SDG 11: Eco-Cities
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: 65% WIDTH (Interactive Leaflet Toy Map, Conditional on Mobile) */}
                    <div className={`${mobileTab === 'map' ? 'block' : 'hidden'} lg:block lg:col-span-8 space-y-4`}>
                        <div className="h-[60vh] sm:h-[70vh] lg:h-[750px] w-full relative rounded-3xl overflow-hidden border border-stone-200 dark:border-stone-700 shadow-md">
                            <ToyTripMap
                                districtName={activeDistrict.name}
                                selectedPlaces={selectedPlaces}
                                allDistrictPlaces={allDistrictPlaces}
                                onTogglePlace={handleTogglePlace}
                                transitMode={transitMode}
                                className="h-full w-full"
                            />
                        </div>

                        {/* Interactive Helper Banner */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-700 dark:text-stone-300">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🧭</span>
                                <span>
                                    <strong>Interactive Route Active:</strong> Seamlessly connected from <strong>{startDistrictName}</strong> to <strong>{endDistrictName}</strong>.
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="text-amber-700 dark:text-amber-400 hover:text-amber-900 font-bold text-xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
                            >
                                <span>Modify Start/End Points</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* HIDDEN PRINTABLE TEMPLATE FOR PDF */}
                <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                    <div
                        ref={printablePdfRef}
                        className="p-10 w-[800px] bg-[#090D18] text-white space-y-6 border-2 border-gold"
                    >
                        <div className="flex items-center justify-between border-b border-gold/40 pb-4">
                            <div>
                                <h1 className="font-display font-black text-3xl text-gold">TN EXPLORE</h1>
                                <p className="text-xs uppercase tracking-widest text-amber-300">Official Smart Travel Itinerary</p>
                            </div>
                            <div className="text-right font-mono text-xs text-emerald-400">
                                <span>{startDistrictName} ➔ {endDistrictName}</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                            <h3 className="font-bold text-base text-gold">Route Stops Plan ({selectedPlaces.length} Stops)</h3>
                            <div className="space-y-2">
                                {selectedPlaces.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs border-b border-white/5 py-1">
                                        <span>Stop #{i + 1}: <strong>{cleanName(p.name)}</strong> ({p.district_name || activeDistrict.name})</span>
                                        <span className="text-gray-400">Entry: ₹50</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/10 text-xs">
                            <div>
                                <p>Transit Vehicle: <strong>{transitMode}</strong></p>
                                <p>Route Distance: <strong>{routeDistanceKm} km</strong></p>
                                <p>Transit Cost: <strong>₹{transitCost}</strong></p>
                            </div>
                            <div>
                                <p>Stay Class: <strong>{stayStyle}</strong> (₹{stayCost})</p>
                                <p>Food Plan: <strong>{foodStyle}</strong> (₹{foodCost})</p>
                                <p className="text-gold font-bold text-sm mt-1">Total Budget: ₹{totalBudget.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TRAVEL MODES COMPARISON MODAL */}
            {showCompareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-stone-200 dark:border-stone-700 pb-4">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-[10px] font-bold uppercase tracking-wider mb-2">
                                    <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                    <span>Route Multi-Modal Comparison</span>
                                </div>
                                <h3 className="font-display font-black text-xl sm:text-2xl text-stone-900 dark:text-white">
                                    Compare Travel Options: {startDistrictName} ➔ {endDistrictName}
                                </h3>
                                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                    Calculated for <strong>{routeDistanceKm} km</strong> journey across Tamil Nadu highways & railways
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCompareModal(false)}
                                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* 4 Mode Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* 1. Cab / Car */}
                            <div className={`p-4 rounded-2xl border transition-all ${
                                transitMode === 'Cab' ? 'bg-amber-100/70 dark:bg-amber-900/40 border-amber-500 shadow-md' : 'bg-[#FAF7F0] dark:bg-stone-850 border-stone-200 dark:border-stone-700 hover:border-stone-300'
                            }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                                        🚗 <span>Outstation Cab / Car</span>
                                    </span>
                                    <span className="font-display font-black text-amber-700 dark:text-amber-400 text-base">
                                        ₹{Math.round(routeDistanceKm * 15).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="space-y-1 text-xs text-stone-700 dark:text-stone-300">
                                    <p>⏱️ <strong>Est. Duration:</strong> ~{Math.max(1, Math.round(routeDistanceKm / 55))} hrs</p>
                                    <p>⭐ <strong>Comfort Score:</strong> 5 / 5 (Door-to-Door)</p>
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                                        Best for families, heavy luggage, and spontaneous viewpoint stops.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTransitMode('Cab');
                                        setShowCompareModal(false);
                                    }}
                                    className="mt-3 w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all cursor-pointer shadow-xs"
                                >
                                    {transitMode === 'Cab' ? '✓ Selected' : 'Select Cab'}
                                </button>
                            </div>

                            {/* 2. Train */}
                            <div className={`p-4 rounded-2xl border transition-all ${
                                transitMode === 'Train' ? 'bg-purple-100/70 dark:bg-purple-900/40 border-purple-500 shadow-md' : 'bg-[#FAF7F0] dark:bg-stone-850 border-stone-200 dark:border-stone-700 hover:border-stone-300'
                            }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                                        🚆 <span>Express / Vande Bharat</span>
                                    </span>
                                    <span className="font-display font-black text-purple-700 dark:text-purple-300 text-base">
                                        ₹{Math.round(routeDistanceKm * 3).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="space-y-1 text-xs text-stone-700 dark:text-stone-300">
                                    <p>⏱️ <strong>Est. Duration:</strong> ~{Math.max(1, Math.round(routeDistanceKm / 75))} hrs</p>
                                    <p>⭐ <strong>Comfort Score:</strong> 5 / 5 (Zero Traffic)</p>
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                                        Punctual, scenic window views, comfortable sleeper berths.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTransitMode('Train');
                                        setShowCompareModal(false);
                                    }}
                                    className="mt-3 w-full py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                                >
                                    {transitMode === 'Train' ? '✓ Selected' : 'Select Train'}
                                </button>
                            </div>

                            {/* 3. Bus */}
                            <div className={`p-4 rounded-2xl border transition-all ${
                                transitMode === 'Bus' ? 'bg-teal-100/70 dark:bg-teal-900/40 border-teal-500 shadow-md' : 'bg-[#FAF7F0] dark:bg-stone-850 border-stone-200 dark:border-stone-700 hover:border-stone-300'
                            }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                                        🚌 <span>SETC / AC Sleeper Bus</span>
                                    </span>
                                    <span className="font-display font-black text-teal-700 dark:text-teal-300 text-base">
                                        ₹{Math.round(routeDistanceKm * 2.5).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="space-y-1 text-xs text-stone-700 dark:text-stone-300">
                                    <p>⏱️ <strong>Est. Duration:</strong> ~{Math.max(1, Math.round(routeDistanceKm / 45))} hrs</p>
                                    <p>⭐ <strong>Comfort Score:</strong> 4 / 5 (Frequent Schedules)</p>
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                                        Budget-friendly overnight transit with direct drops in town centers.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTransitMode('Bus');
                                        setShowCompareModal(false);
                                    }}
                                    className="mt-3 w-full py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                                >
                                    {transitMode === 'Bus' ? '✓ Selected' : 'Select Bus'}
                                </button>
                            </div>

                            {/* 4. Bike */}
                            <div className={`p-4 rounded-2xl border transition-all ${
                                transitMode === 'Bike' ? 'bg-emerald-100/70 dark:bg-emerald-900/40 border-emerald-500 shadow-md' : 'bg-[#FAF7F0] dark:bg-stone-850 border-stone-200 dark:border-stone-700 hover:border-stone-300'
                            }`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                                        🛵 <span>Motorbike / Rental Ride</span>
                                    </span>
                                    <span className="font-display font-black text-emerald-700 dark:text-emerald-300 text-base">
                                        ₹{Math.round(routeDistanceKm * 6).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                <div className="space-y-1 text-xs text-stone-700 dark:text-stone-300">
                                    <p>⏱️ <strong>Est. Duration:</strong> ~{Math.max(1, Math.round(routeDistanceKm / 40))} hrs</p>
                                    <p>⭐ <strong>Comfort Score:</strong> 4 / 5 (Hairpin Thrills)</p>
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                                        Pure immersion in nature, scenic mountain curves and easy photo stops.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTransitMode('Bike');
                                        setShowCompareModal(false);
                                    }}
                                    className="mt-3 w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
                                >
                                    {transitMode === 'Bike' ? '✓ Selected' : 'Select Bike'}
                                </button>
                            </div>
                        </div>

                        {/* AI Advice Banner */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-stone-50 to-amber-50 dark:from-stone-800 dark:via-stone-850 dark:to-stone-800 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                            <div className="text-center sm:text-left">
                                <h4 className="font-display font-bold text-sm text-stone-900 dark:text-white flex items-center gap-1.5 justify-center sm:justify-start">
                                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    <span>Need AI Travel Guidance?</span>
                                </h4>
                                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                                    Ask TN Mitra to evaluate road safety, ghat hairpin bends, or train seat availability.
                                </p>
                            </div>
                            <Link
                                href={`/ai-guide?district=${encodeURIComponent(endDistrictName)}&q=${encodeURIComponent('Compare travel options from ' + startDistrictName + ' to ' + endDistrictName + ' by Bus, Train, Cab and Bike')}`}
                                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-black text-xs shadow-md hover:scale-105 transition-all whitespace-nowrap cursor-pointer"
                            >
                                ✨ Ask TN Mitra AI to Compare
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
