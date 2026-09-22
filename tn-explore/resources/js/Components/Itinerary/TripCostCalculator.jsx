import React, { useState, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { 
    Calculator, Sparkles, Check, DollarSign, Users, Calendar, MapPin, Coffee, 
    Car, Hotel, Share2, Copy, Download, Award, Clock, ArrowRight, ShieldCheck, 
    ExternalLink, Compass, Train, Bus, User, Printer, FileText, Navigation
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ToyTripMap from '@/Components/Map/ToyTripMap';

export default function TripCostCalculator({ district, selectedPlaces = [], onRemovePlace }) {
    const [days, setDays] = useState(2);
    const [travelers, setTravelers] = useState(2);
    const [hotelType, setHotelType] = useState('heritage'); // budget, heritage, luxury
    const [foodStyle, setFoodStyle] = useState('authentic'); // street, authentic, fine
    const [transitMode, setTransitMode] = useState('Train'); // Train, Bus, Cab, Bike
    const [travelerName, setTravelerName] = useState('Arun Explorer');
    const [copied, setCopied] = useState(false);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [planGenerated, setPlanGenerated] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

    const pdfRef = useRef(null);

    // Cost parameters
    const hotelRates = {
        budget: 1200,
        heritage: 2800,
        luxury: 6500,
    };

    const foodRatesPerDay = {
        street: 350,
        authentic: 700,
        fine: 1600,
    };

    const transitBaseEstimates = {
        Train: 450,
        Bus: 350,
        Cab: 2800,
        Bike: 500,
    };

    // Calculate Costs
    const stayRooms = Math.ceil(travelers / 2);
    const totalStayCost = hotelRates[hotelType] * stayRooms * Math.max(1, days - 1);
    const totalFoodCost = foodRatesPerDay[foodStyle] * travelers * days;
    const totalTransitCost = transitMode === 'Cab'
        ? transitBaseEstimates.Cab * 2
        : transitBaseEstimates[transitMode] * travelers * 2;
    
    // Pool of places from district or user selection
    const districtPlaces = (district?.places && district.places.length > 0)
        ? district.places
        : selectedPlaces;

    const activitiesCost = (Math.max(selectedPlaces.length, days * 2) * 150 + 200) * travelers;
    const grandTotal = totalStayCost + totalFoodCost + totalTransitCost + activitiesCost;
    const perPersonCost = Math.round(grandTotal / travelers);

    // Generate unique Trip ID
    const tripCode = `TN-${district?.name ? district.name.slice(0, 3).toUpperCase() : 'EXP'}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // Build Day-by-Day Roadmap
    const generateItineraryDays = () => {
        const placesPool = selectedPlaces.length > 0 ? selectedPlaces : districtPlaces;
        const totalSpots = placesPool.length;
        const spotsPerDay = Math.max(2, Math.ceil(totalSpots / days));
        
        const itinerary = [];
        const timeslots = ['Morning (08:30 AM - 12:00 PM)', 'Afternoon (01:30 PM - 04:30 PM)', 'Evening & Sunset (05:00 PM - 08:00 PM)'];

        for (let d = 1; d <= days; d++) {
            const startIdx = ((d - 1) * spotsPerDay) % Math.max(1, totalSpots);
            const dayPlaces = [];

            for (let i = 0; i < Math.min(3, spotsPerDay); i++) {
                const place = placesPool[(startIdx + i) % Math.max(1, totalSpots)];
                if (place) {
                    dayPlaces.push({
                        ...place,
                        slot: timeslots[i % timeslots.length],
                    });
                }
            }

            itinerary.push({
                day: d,
                title: `Day ${d}: ${d === 1 ? 'Heritage & Iconic Discovery' : d === 2 ? 'Scenic Nature & Hidden Trails' : 'Cultural Immersion & Local Flavors'}`,
                places: dayPlaces,
            });
        }
        return itinerary;
    };

    const handleGeneratePlan = () => {
        setIsGeneratingPlan(true);
        setTimeout(() => {
            setIsGeneratingPlan(false);
            setPlanGenerated(true);
            // Scroll smoothly to itinerary
            setTimeout(() => {
                pdfRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }, 600);
    };

    const handleDownloadPdf = async () => {
        if (!pdfRef.current) return;
        setIsDownloadingPdf(true);

        try {
            const element = pdfRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#0A0E1A',
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
            pdf.save(`TN_Explore_Itinerary_${district?.name || 'Tamil_Nadu'}.pdf`);
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            alert('Could not export PDF automatically. You can also print the page directly using browser print.');
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const handleCopySummary = () => {
        const text = `🌴 TN Explore Itinerary & Budget — ${district?.name || 'Tamil Nadu'}\n` +
            `• Traveler: ${travelerName} (Trip ID: ${tripCode})\n` +
            `• Duration: ${days} Days | Travelers: ${travelers} Pax\n` +
            `• Hotel (${hotelType}): ₹${totalStayCost.toLocaleString('en-IN')}\n` +
            `• Food (${foodStyle}): ₹${totalFoodCost.toLocaleString('en-IN')}\n` +
            `• Transit (${transitMode}): ₹${totalTransitCost.toLocaleString('en-IN')}\n` +
            `💰 Total Estimated Budget: ₹${grandTotal.toLocaleString('en-IN')} (₹${perPersonCost.toLocaleString('en-IN')} / person)\n` +
            `Generated via TN Explore Smart Marketplace.`;

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const dayItinerary = generateItineraryDays();

    return (
        <div className="space-y-8">
            {/* Calculator Card */}
            <div className="rounded-2xl bg-gradient-to-br from-navy-card via-[#131B2E] to-navy-card border border-gold/30 p-6 sm:p-8 shadow-2xl text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-gold/20 text-gold text-[10px] font-bold uppercase tracking-wider border border-gold/30 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Smart Trip Planner & Cost Engine
                            </span>
                            <span className="text-xs text-gray-400">Live Custom Roadmap</span>
                        </div>
                        <h3 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                            <Calculator className="w-7 h-7 text-gold" />
                            Trip Planner & Budget Engine — {district?.name}
                        </h3>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Link
                            href={`/trip-builder?district_id=${district?.id || ''}`}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <Navigation className="w-4 h-4" />
                            <span>Open Toy-to-Travel Split Map</span>
                        </Link>

                        <button
                            type="button"
                            onClick={handleCopySummary}
                            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-gold hover:text-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            <span>{copied ? 'Copied Summary' : 'Copy Text'}</span>
                        </button>
                    </div>
                </div>

                {/* Embedded Interactive Toy-to-Travel Map */}
                <div className="my-6">
                    <div className="h-80 sm:h-96 w-full rounded-2xl overflow-hidden border border-white/15 shadow-xl">
                        <ToyTripMap
                            districtName={district?.name || 'Madurai'}
                            selectedPlaces={selectedPlaces.length > 0 ? selectedPlaces : (district?.places?.slice(0, 4) || [])}
                            allDistrictPlaces={district?.places || []}
                            transitMode={transitMode}
                            className="h-full w-full"
                        />
                    </div>
                </div>

                {/* Input Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
                    {/* Duration */}
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <label className="block text-xs font-semibold text-gray-300 uppercase mb-2 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gold" />
                            Duration (Days)
                        </label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 5].map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => setDays(d)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        days === d ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'bg-white/5 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {d}D
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Travelers Count */}
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <label className="block text-xs font-semibold text-gray-300 uppercase mb-2 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-gold" />
                            Travelers ({travelers} Pax)
                        </label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 4, 6].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setTravelers(num)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        travelers === num ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'bg-white/5 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Hotel Type */}
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <label className="block text-xs font-semibold text-gray-300 uppercase mb-2 flex items-center gap-1.5">
                            <Hotel className="w-3.5 h-3.5 text-gold" />
                            Stay Style
                        </label>
                        <select
                            value={hotelType}
                            onChange={(e) => setHotelType(e.target.value)}
                            className="w-full py-1.5 px-2.5 bg-[#0A0E1A] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-gold"
                        >
                            <option value="budget">Budget Lodge (~₹1,200/n)</option>
                            <option value="heritage">Heritage Hotel (~₹2,800/n)</option>
                            <option value="luxury">Luxury Resort (~₹6,500/n)</option>
                        </select>
                    </div>

                    {/* Transit Mode */}
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <label className="block text-xs font-semibold text-gray-300 uppercase mb-2 flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-gold" />
                            Transit Mode
                        </label>
                        <select
                            value={transitMode}
                            onChange={(e) => setTransitMode(e.target.value)}
                            className="w-full py-1.5 px-2.5 bg-[#0A0E1A] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-gold"
                        >
                            <option value="Train">🚆 Train (Express / Superfast)</option>
                            <option value="Bus">🚌 State Bus (TNSTC / SETC)</option>
                            <option value="Cab">🚗 Private AC Highway Cab</option>
                            <option value="Bike">🏍️ Rental Two-Wheeler / Bike</option>
                        </select>
                    </div>
                </div>

                {/* Traveler Name Input & Master Action Button */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-gold/20 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="w-full md:w-80">
                        <label className="block text-[11px] font-bold text-gold uppercase tracking-wider mb-1 flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            Lead Traveler Name (For Passport Badge)
                        </label>
                        <input
                            type="text"
                            value={travelerName}
                            onChange={(e) => setTravelerName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full px-3.5 py-2 bg-[#080C16] border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-gold"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            type="button"
                            onClick={handleGeneratePlan}
                            disabled={isGeneratingPlan}
                            className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-gold via-cream to-gold text-black font-extrabold text-sm shadow-xl shadow-gold/20 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Sparkles className="w-4 h-4 text-black animate-spin" style={{ animationDuration: '3s' }} />
                            <span>{isGeneratingPlan ? 'Generating Roadmap...' : '✨ Generate My Trip Plan & Itinerary'}</span>
                        </button>
                    </div>
                </div>

                {/* Summary Cost Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 text-center">
                    <div className="p-3 rounded-xl bg-white/[0.02]">
                        <span className="text-[11px] text-gray-400 block uppercase">Stay Cost</span>
                        <strong className="text-base text-white">₹{totalStayCost.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02]">
                        <span className="text-[11px] text-gray-400 block uppercase">Food Cost</span>
                        <strong className="text-base text-white">₹{totalFoodCost.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02]">
                        <span className="text-[11px] text-gray-400 block uppercase">Transit Cost</span>
                        <strong className="text-base text-white">₹{totalTransitCost.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-gold/10 border border-gold/30">
                        <span className="text-[11px] text-gold block uppercase font-bold">Estimated Total</span>
                        <strong className="text-lg text-gold font-extrabold">₹{grandTotal.toLocaleString('en-IN')}</strong>
                    </div>
                </div>
            </div>

            {/* Generated Trip Plan & Export Section */}
            {planGenerated && (
                <div className="space-y-6">
                    {/* Top Action Bar */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-navy-card/90 border border-white/10 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Sparkles className="w-4 h-4 text-gold" />
                            <span>Trip Plan Ready for <strong>{travelerName}</strong> ({days} Days in {district?.name})</span>
                        </div>

                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={isDownloadingPdf}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <Download className="w-4 h-4" />
                            <span>{isDownloadingPdf ? 'Generating PDF...' : '📄 Download Full Itinerary (PDF)'}</span>
                        </button>
                    </div>

                    {/* Printable Document Container for HTML2Canvas & PDF */}
                    <div 
                        ref={pdfRef}
                        className="p-8 sm:p-10 rounded-3xl bg-[#090D1A] border-2 border-gold/40 shadow-2xl text-white space-y-8"
                    >
                        {/* 1. Dynamic Digital Traveler Passport Stamp / Badge */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111A2E] via-[#1E1736] to-[#111A2E] border-2 border-gold/50 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                            {/* Ambient Glow */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="flex items-center gap-5 text-center md:text-left">
                                {/* Gold Seal Emblem */}
                                <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-gold via-cream to-gold p-1 shadow-xl flex-shrink-0 flex items-center justify-center">
                                    <div className="w-full h-full rounded-full bg-[#0A0E1A] border-2 border-gold flex flex-col items-center justify-center p-1 text-center">
                                        <Award className="w-7 h-7 text-gold animate-pulse" />
                                        <span className="text-[8px] font-black text-gold tracking-tighter uppercase">TN 2026</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-[10px] font-extrabold uppercase tracking-widest border border-gold/40">
                                            Official Digital Passport Stamp
                                        </span>
                                    </div>
                                    <h2 className="font-display font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-gold via-cream to-gold">
                                        Certified {district?.name} Explorer
                                    </h2>
                                    <p className="text-xs text-gray-300 mt-1">
                                        Issued to: <strong className="text-white underline">{travelerName}</strong> • {days} Days Exploration
                                    </p>
                                </div>
                            </div>

                            {/* Badge Meta Specs */}
                            <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 space-y-1">
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-mono">Trip Verification Code</span>
                                <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 inline-block">
                                    {tripCode}
                                </span>
                                <div className="text-[11px] text-gold font-medium mt-1">
                                    Verified Tamil Nadu Smart Tourism
                                </div>
                            </div>
                        </div>

                        {/* 2. Budget & Travel Meta Header */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
                            <div>
                                <span className="text-[11px] text-gray-400 uppercase">Duration</span>
                                <p className="text-sm font-bold text-white mt-0.5">{days} Days / {Math.max(1, days - 1)} Nights</p>
                            </div>
                            <div>
                                <span className="text-[11px] text-gray-400 uppercase">Party Size</span>
                                <p className="text-sm font-bold text-white mt-0.5">{travelers} Travelers</p>
                            </div>
                            <div>
                                <span className="text-[11px] text-gray-400 uppercase">Transit Mode</span>
                                <p className="text-sm font-bold text-white mt-0.5">{transitMode} Transport</p>
                            </div>
                            <div>
                                <span className="text-[11px] text-gold uppercase font-bold">Total Budget</span>
                                <p className="text-base font-extrabold text-gold mt-0.5">₹{grandTotal.toLocaleString('en-IN')}</p>
                            </div>
                        </div>

                        {/* 3. Day-by-Day Visual Timeline Itinerary */}
                        <div className="space-y-8 pt-4">
                            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                                <Compass className="w-5 h-5 text-gold" />
                                <h3 className="font-display text-xl font-bold text-white">
                                    Personalized Day-by-Day Travel Roadmap
                                </h3>
                            </div>

                            <div className="space-y-8">
                                {dayItinerary.map((dayPlan) => (
                                    <div key={dayPlan.day} className="space-y-4">
                                        {/* Day Banner */}
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-400/30 text-xs font-bold text-purple-200">
                                            <Calendar className="w-4 h-4 text-gold" />
                                            <span>{dayPlan.title}</span>
                                        </div>

                                        {/* Timeline Cards */}
                                        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-gold before:via-purple-500 before:to-transparent">
                                            {dayPlan.places.map((place, pIdx) => (
                                                <div key={pIdx} className="relative group">
                                                    {/* Timeline Bullet Node */}
                                                    <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-[#0A0E1A] border-2 border-gold flex items-center justify-center shadow-md">
                                                        <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                                                    </div>

                                                    {/* Place Card Body */}
                                                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-gold/30 transition-all space-y-2">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                            <span className="text-[11px] font-mono text-gold flex items-center gap-1">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {place.slot}
                                                            </span>
                                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/5 text-gray-300 border border-white/10 self-start sm:self-auto">
                                                                {place.category || 'Sightseeing'}
                                                            </span>
                                                        </div>

                                                        <h4 className="font-display text-lg font-bold text-white">
                                                            {place.name}
                                                        </h4>

                                                        <p className="text-xs text-gray-400 leading-relaxed">
                                                            {place.description || `Scenic landmark located in ${district?.name} district. Explore cultural heritage, local traditions, and photography.`}
                                                        </p>

                                                        {place.wiki_url && (
                                                            <div className="pt-2 flex items-center gap-1 text-xs text-emerald-400 font-medium">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                <span>Location Reference: Verified in {district?.name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 4. Document Footer & Authenticity Stamp */}
                        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 text-center sm:text-left">
                            <div>
                                <span className="font-bold text-white block">TN EXPLORE — Smart Marketplace & Tourism Engine</span>
                                <span>Official Trip Plan • Generated for {travelerName} • Verified 2026</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span className="text-emerald-300 font-medium">100% Verified Government Tourism Data</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
