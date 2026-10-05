import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/UI/Button';
import axios from 'axios';
import {
    Compass,
    MapPin,
    Users,
    Calendar,
    IndianRupee,
    Sparkles,
    Car,
    Hotel,
    Utensils,
    CheckCircle2,
    ArrowRight,
    Mountain,
    Camera,
    Landmark,
    Waves,
    Tent,
    Zap,
    ThumbsUp,
    SlidersHorizontal,
    Share2,
    ChevronDown,
    ChevronUp,
    Heart,
    Store,
    Clock,
    RefreshCw,
    Info,
    HelpCircle,
    Check
} from 'lucide-react';

const COMMON_START_CITIES = [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli (Trichy)',
    'Salem', 'Tirunelveli', 'Bangalore', 'Kochi / Cochin'
];

export default function Create({
    districts = [],
    states = [],
    places = [],
    popularCircuits = [],
    initialPlan = null,
    initialIdeas = null,
    readyPackages = []
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    // Mode Selection: 'ideas' | 'own_trip' | 'packages'
    const [mode, setMode] = useState('ideas');

    // Q2: Group selection
    const [groupType, setGroupType] = useState('couple');
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);

    // Q3: Place types (Interests)
    const [placeTypes, setPlaceTypes] = useState(['heritage', 'hills']);

    // Q4: Region
    const [region, setRegion] = useState('inside_tn'); // 'inside_tn' | 'outside_tn' | 'both'

    // Budget & Days Line
    const [budgetBasis, setBudgetBasis] = useState('total'); // 'total' | 'per_person'
    const [budgetValue, setBudgetValue] = useState(25000);
    const [days, setDays] = useState(3);
    const [notSureDays, setNotSureDays] = useState(false);

    // Start City & Dates (for Own Trip mode)
    const [startPlace, setStartPlace] = useState('Chennai');
    const [startDate, setStartDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);

    // Idea Cards State
    const [ideasState, setIdeasState] = useState(initialIdeas?.ideas || []);
    const [surpriseMe, setSurpriseMe] = useState(initialIdeas?.surprise_me || null);
    const [budgetGuidance, setBudgetGuidance] = useState(initialIdeas?.budget_guidance || null);
    const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);

    // Own Trip Plan Options State
    const [planData, setPlanData] = useState(initialPlan);
    const [selectedTier, setSelectedTier] = useState('balanced');
    const [showFineTune, setShowFineTune] = useState(false);
    const [isCalculatingPlan, setIsCalculatingPlan] = useState(false);

    // Fine-tune overrides
    const [customTransport, setCustomTransport] = useState('');
    const [customStay, setCustomStay] = useState('balanced');
    const [customGuide, setCustomGuide] = useState(false);

    // Natural language optional box
    const [showNlpBox, setShowNlpBox] = useState(false);
    const [nlpPrompt, setNlpPrompt] = useState('');
    const [shareUrl, setShareUrl] = useState(null);

    // Popular suggested destinations based on region
    const defaultDestinationsByRegion = {
        inside_tn: ['Madurai', 'Rameswaram', 'Kanniyakumari', 'Ooty', 'Kodaikanal', 'Thanjavur', 'Mahabalipuram', 'Yercaud'],
        outside_tn: ['Munnar', 'Alleppey', 'Thekkady', 'Wayanad', 'Coorg', 'Mysore', 'Puducherry', 'Tirupati'],
        both: ['Chennai', 'Mahabalipuram', 'Puducherry', 'Bangalore', 'Mysore', 'Ooty', 'Coimbatore', 'Munnar']
    };

    const [selectedDestinations, setSelectedDestinations] = useState(['Madurai', 'Rameswaram', 'Kanniyakumari']);

    // Update selected destinations when region changes
    useEffect(() => {
        if (region === 'outside_tn') {
            if (placeTypes.includes('hills') || placeTypes.includes('wildlife')) {
                setSelectedDestinations(['Munnar', 'Thekkady', 'Alleppey']);
            } else if (placeTypes.includes('heritage')) {
                setSelectedDestinations(['Coorg', 'Mysore']);
            } else {
                setSelectedDestinations(['Munnar', 'Alleppey']);
            }
        } else if (region === 'both') {
            setSelectedDestinations(['Chennai', 'Mahabalipuram', 'Puducherry']);
        } else {
            if (placeTypes.includes('hills')) {
                setSelectedDestinations(['Ooty', 'Kodaikanal']);
            } else if (placeTypes.includes('temples') || placeTypes.includes('heritage')) {
                setSelectedDestinations(['Madurai', 'Rameswaram', 'Kanniyakumari']);
            } else {
                setSelectedDestinations(['Madurai', 'Thanjavur', 'Rameswaram']);
            }
        }
    }, [region, placeTypes]);

    const toggleDestination = (dest) => {
        if (selectedDestinations.includes(dest)) {
            if (selectedDestinations.length > 1) {
                setSelectedDestinations(selectedDestinations.filter(d => d !== dest));
            }
        } else {
            setSelectedDestinations([...selectedDestinations, dest]);
        }
    };

    // Pre-select group size on group type change
    const handleGroupTypeChange = (type) => {
        setGroupType(type);
        if (type === 'solo') {
            setAdults(1);
            setChildren(0);
        } else if (type === 'couple') {
            setAdults(2);
            setChildren(0);
        } else if (type === 'family') {
            setAdults(2);
            setChildren(2);
        } else if (type === 'friends') {
            setAdults(4);
            setChildren(0);
        } else if (type === 'colleagues') {
            setAdults(8);
            setChildren(0);
        }
    };

    const togglePlaceType = (typeId) => {
        if (placeTypes.includes(typeId)) {
            if (placeTypes.length > 1) {
                setPlaceTypes(placeTypes.filter(t => t !== typeId));
            }
        } else {
            setPlaceTypes([...placeTypes, typeId]);
        }
    };

    // Calculate effective total budget
    const effectiveTotalBudget = useMemo(() => {
        if (budgetBasis === 'per_person') {
            return Number(budgetValue) * Math.max(1, adults);
        }
        return Number(budgetValue);
    }, [budgetValue, budgetBasis, adults]);

    // Fetch dynamic ideas when parameters change
    useEffect(() => {
        let isMounted = true;
        const fetchIdeas = async () => {
            setIsLoadingIdeas(true);
            try {
                const res = await axios.post('/custom-trips/ideas/generate', {
                    budget_total: effectiveTotalBudget,
                    budget_basis: 'total',
                    adults_count: adults,
                    children_count: children,
                    place_types: placeTypes,
                    region: region,
                    days: notSureDays ? null : days,
                });
                if (isMounted && res.data.success) {
                    setIdeasState(res.data.data.ideas || []);
                    setSurpriseMe(res.data.data.surprise_me || null);
                    setBudgetGuidance(res.data.data.budget_guidance || null);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (isMounted) setIsLoadingIdeas(false);
            }
        };

        const timer = setTimeout(fetchIdeas, 300);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [effectiveTotalBudget, adults, children, placeTypes, region, days, notSureDays]);

    // Fetch 3-plan comparison for own-trip mode
    const fetchOwnTripPlans = async () => {
        setIsCalculatingPlan(true);
        try {
            const res = await axios.post('/custom-trips/generate-plan', {
                scope: region,
                start_place: startPlace,
                end_place: startPlace,
                route_type: 'round',
                destinations: selectedDestinations.length > 0 ? selectedDestinations : [startPlace],
                days: notSureDays ? 3 : days,
                budget_total: effectiveTotalBudget,
                budget_basis: 'total',
                travelers: { adults, children },
                preferences: {
                    interests: placeTypes,
                    transport: customTransport || (adults <= 3 ? 'sedan' : (adults <= 6 ? 'suv' : 'tempo')),
                    stay_level: customStay,
                    guide: customGuide,
                }
            });
            if (res.data.success) {
                setPlanData(res.data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsCalculatingPlan(false);
        }
    };

    useEffect(() => {
        if (mode === 'own_trip') {
            fetchOwnTripPlans();
        }
    }, [mode, startPlace, region, days, effectiveTotalBudget, adults, children, customTransport, customStay, customGuide, selectedDestinations, placeTypes]);

    // Handle copying circuit into own trip flow
    const handleCustomizeCircuit = (circuit) => {
        setMode('own_trip');
        setStartPlace(circuit.start_city || 'Chennai');
        setDays(circuit.days);
        if (circuit.destinations && Array.isArray(circuit.destinations)) {
            setSelectedDestinations(circuit.destinations);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Share ideas with Trip Mates
    const handleShareIdeas = async () => {
        try {
            const res = await axios.post('/custom-trips/ideas/share', {
                ideas: ideasState,
                pax: adults + children,
                budget: effectiveTotalBudget,
            });
            if (res.data.success) {
                setShareUrl(res.data.share_url);
                navigator.clipboard.writeText(res.data.share_url);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Submitting an Own Trip request
    const { post, processing } = useForm();
    const handleSubmitCustomTrip = () => {
        const payload = {
            title: `${startPlace} ${days}-Day Tour for ${adults + children} Travelers`,
            scope: region,
            start_place: startPlace,
            end_place: startPlace,
            route_type: 'round',
            destinations: selectedDestinations.length > 0 ? selectedDestinations : [startPlace],
            trip_type: groupType,
            date_mode: 'exact',
            start_date: startDate,
            duration_days: days,
            days: days,
            adults_count: adults,
            children_count: children,
            travelers: { adults, children },
            budget_total: effectiveTotalBudget,
            budget_basis: 'total',
            stay_level: customStay,
            transport: customTransport || (adults <= 3 ? 'sedan' : (adults <= 6 ? 'suv' : 'tempo')),
            guide: customGuide,
            selected_plan: selectedTier,
            notes: nlpPrompt,
        };

        axios.post('/custom-trips', payload)
            .then(res => {
                window.location.href = '/custom-trips';
            })
            .catch(err => {
                console.error(err);
            });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Plan a Trip — TN Explore" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
                {/* 1. Header Hero */}
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#8B1E2D]/10 text-[#8B1E2D] dark:text-[#E7A8AF]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Smart Travel Planner</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif font-black text-[var(--text)] tracking-tight">
                        Plan your perfect trip in 4 quick taps
                    </h1>
                    <p className="text-sm text-[var(--muted)]">
                        No long complicated forms. Pick your preferences, and let the system calculate real options for your group.
                    </p>
                </div>

                {/* 2. The 4-Tap Guided Selector */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-8">
                    
                    {/* Q1: What do you want? */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                            1. What do you want?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setMode('ideas')}
                                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                    mode === 'ideas'
                                        ? 'bg-[#8B1E2D]/5 dark:bg-[#8B1E2D]/15 border-[#8B1E2D] text-[var(--text)] ring-1 ring-[#8B1E2D]'
                                        : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text)] hover:border-[#8B1E2D]/40'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <Sparkles className={`w-5 h-5 ${mode === 'ideas' ? 'text-[#8B1E2D] dark:text-[#E7A8AF]' : 'text-[var(--muted)]'}`} />
                                    {mode === 'ideas' && <Check className="w-4 h-4 text-[#8B1E2D] dark:text-[#E7A8AF]" />}
                                </div>
                                <div className="font-bold text-sm mt-2">I'm not sure, give me ideas</div>
                                <div className="text-xs text-[var(--muted)] mt-0.5">Ranked circuit ideas that fit your budget</div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setMode('own_trip')}
                                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                    mode === 'own_trip'
                                        ? 'bg-[#8B1E2D]/5 dark:bg-[#8B1E2D]/15 border-[#8B1E2D] text-[var(--text)] ring-1 ring-[#8B1E2D]'
                                        : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text)] hover:border-[#8B1E2D]/40'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <Calendar className={`w-5 h-5 ${mode === 'own_trip' ? 'text-[#8B1E2D] dark:text-[#E7A8AF]' : 'text-[var(--muted)]'}`} />
                                    {mode === 'own_trip' && <Check className="w-4 h-4 text-[#8B1E2D] dark:text-[#E7A8AF]" />}
                                </div>
                                <div className="font-bold text-sm mt-2">Plan my own trip</div>
                                <div className="text-xs text-[var(--muted)] mt-0.5">3-tier pricing (Budget, Balanced, Comfort)</div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setMode('packages')}
                                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                                    mode === 'packages'
                                        ? 'bg-[#8B1E2D]/5 dark:bg-[#8B1E2D]/15 border-[#8B1E2D] text-[var(--text)] ring-1 ring-[#8B1E2D]'
                                        : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text)] hover:border-[#8B1E2D]/40'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <Store className={`w-5 h-5 ${mode === 'packages' ? 'text-[#8B1E2D] dark:text-[#E7A8AF]' : 'text-[var(--muted)]'}`} />
                                    {mode === 'packages' && <Check className="w-4 h-4 text-[#8B1E2D] dark:text-[#E7A8AF]" />}
                                </div>
                                <div className="font-bold text-sm mt-2">Ready-made packages</div>
                                <div className="text-xs text-[var(--muted)] mt-0.5">Verified tours with fixed departure dates</div>
                            </button>
                        </div>
                    </div>

                    {/* Q2: Who is going? */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                                2. Who is going?
                            </label>
                            <span className="text-xs text-[var(--muted)]">
                                Total travelers: <strong className="text-[var(--text)]">{adults + children}</strong>
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {[
                                { id: 'solo', label: 'Solo (1)' },
                                { id: 'couple', label: 'Couple (2)' },
                                { id: 'family', label: 'Family (3–5)' },
                                { id: 'friends', label: 'Friends (4–8)' },
                                { id: 'colleagues', label: 'Colleagues (5–15)' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleGroupTypeChange(item.id)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                        groupType === item.id
                                            ? 'bg-[#8B1E2D] text-white border-[#8B1E2D] shadow-sm'
                                            : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text)] hover:border-[#8B1E2D]/40'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}

                            {/* Fine-tune adults / children counter */}
                            <div className="flex items-center gap-2 ml-auto p-1 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs">
                                <div className="flex items-center gap-1.5 px-2">
                                    <span className="text-[var(--muted)]">Adults:</span>
                                    <button
                                        type="button"
                                        onClick={() => setAdults(Math.max(1, adults - 1))}
                                        className="w-5 h-5 rounded-md bg-[var(--card)] hover:bg-stone-200 dark:hover:bg-stone-700 font-bold flex items-center justify-center text-xs"
                                    >
                                        -
                                    </button>
                                    <span className="font-bold text-[var(--text)] w-4 text-center">{adults}</span>
                                    <button
                                        type="button"
                                        onClick={() => setAdults(adults + 1)}
                                        className="w-5 h-5 rounded-md bg-[var(--card)] hover:bg-stone-200 dark:hover:bg-stone-700 font-bold flex items-center justify-center text-xs"
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 border-l border-[var(--border)]">
                                    <span className="text-[var(--muted)]">Children:</span>
                                    <button
                                        type="button"
                                        onClick={() => setChildren(Math.max(0, children - 1))}
                                        className="w-5 h-5 rounded-md bg-[var(--card)] hover:bg-stone-200 dark:hover:bg-stone-700 font-bold flex items-center justify-center text-xs"
                                    >
                                        -
                                    </button>
                                    <span className="font-bold text-[var(--text)] w-4 text-center">{children}</span>
                                    <button
                                        type="button"
                                        onClick={() => setChildren(children + 1)}
                                        className="w-5 h-5 rounded-md bg-[var(--card)] hover:bg-stone-200 dark:hover:bg-stone-700 font-bold flex items-center justify-center text-xs"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Q3: Place types? */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                            3. What kind of places? (Pick any)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'temples', label: 'Temples & Spiritual', icon: Landmark },
                                { id: 'hills', label: 'Hills & Mist', icon: Mountain },
                                { id: 'beaches', label: 'Beaches & Ocean', icon: Waves },
                                { id: 'wildlife', label: 'Wildlife & Safari', icon: Tent },
                                { id: 'heritage', label: 'Heritage & UNESCO', icon: Landmark },
                                { id: 'adventure', label: 'Adventure & Treks', icon: Zap },
                                { id: 'food', label: 'Food & Culinary', icon: Utensils },
                                { id: 'hidden_gems', label: 'Hidden Gems', icon: Sparkles },
                            ].map(item => {
                                const Icon = item.icon;
                                const isSelected = placeTypes.includes(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => togglePlaceType(item.id)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                                            isSelected
                                                ? 'bg-[#8B1E2D] text-white border-[#8B1E2D] shadow-sm'
                                                : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text)] hover:border-[#8B1E2D]/40'
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Q4: Where? */}
                    <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                            4. Where?
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'inside_tn', label: 'Inside Tamil Nadu' },
                                { id: 'outside_tn', label: 'Outside Tamil Nadu' },
                                { id: 'both', label: 'Anywhere (Combined)' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setRegion(item.id)}
                                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                                        region === item.id
                                            ? 'bg-[#8B1E2D] text-white border-[#8B1E2D] shadow-sm'
                                            : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text)] hover:border-[#8B1E2D]/40'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Single Line: Budget & Days */}
                    <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        {/* Budget */}
                        <div>
                            <div className="flex items-center justify-between text-xs font-semibold mb-1">
                                <span className="text-[var(--text)]">Target Budget</span>
                                <div className="flex items-center gap-2 text-[11px]">
                                    <button
                                        type="button"
                                        onClick={() => setBudgetBasis('total')}
                                        className={`font-bold ${budgetBasis === 'total' ? 'text-[#8B1E2D] dark:text-[#E7A8AF] underline' : 'text-[var(--muted)]'}`}
                                    >
                                        Total
                                    </button>
                                    <span>·</span>
                                    <button
                                        type="button"
                                        onClick={() => setBudgetBasis('per_person')}
                                        className={`font-bold ${budgetBasis === 'per_person' ? 'text-[#8B1E2D] dark:text-[#E7A8AF] underline' : 'text-[var(--muted)]'}`}
                                    >
                                        Per Person
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-xs text-[var(--muted)] font-bold">₹</span>
                                <input
                                    type="number"
                                    value={budgetValue}
                                    onChange={(e) => setBudgetValue(e.target.value)}
                                    step="1000"
                                    min="3000"
                                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-sm font-bold text-[var(--text)] focus:ring-2 focus:ring-[#8B1E2D]/40 outline-none"
                                />
                            </div>
                        </div>

                        {/* Days */}
                        <div>
                            <div className="flex items-center justify-between text-xs font-semibold mb-1">
                                <span className="text-[var(--text)]">Duration (Days)</span>
                                <button
                                    type="button"
                                    onClick={() => setNotSureDays(!notSureDays)}
                                    className={`text-[11px] font-bold ${notSureDays ? 'text-[#8B1E2D] dark:text-[#E7A8AF] underline' : 'text-[var(--muted)]'}`}
                                >
                                    {notSureDays ? '✓ Flexible / Not sure' : 'Not sure? Click here'}
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={days}
                                    disabled={notSureDays}
                                    onChange={(e) => setDays(Math.max(1, Math.min(15, parseInt(e.target.value) || 1)))}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] text-sm font-bold text-[var(--text)] focus:ring-2 focus:ring-[#8B1E2D]/40 outline-none disabled:opacity-50"
                                />
                                <span className="text-xs text-[var(--muted)] font-medium flex-shrink-0">
                                    {notSureDays ? 'Any length' : `${days} days`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Optional: Tell us in your own words helper */}
                    <div className="border-t border-[var(--border)] pt-4 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => setShowNlpBox(!showNlpBox)}
                                className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>{showNlpBox ? 'Hide custom notes' : 'Optional: Tell us in your own words (Auto-Fill helper)'}</span>
                                {showNlpBox ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>

                            {/* PRIMARY ACTION BUTTON TO CALCULATE & SCROLL */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (mode === 'own_trip') {
                                        fetchOwnTripPlans();
                                    }
                                    document.getElementById('plan-results')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#8B1E2D] hover:bg-[#721824] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                            >
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                <span>
                                    {mode === 'own_trip' 
                                        ? '⚡ Generate / View 3-Tier Itinerary Plans ↓' 
                                        : '⚡ Calculate Ranked Trip Ideas ↓'}
                                </span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {showNlpBox && (
                            <div className="mt-3 space-y-2 animate-in fade-in">
                                <textarea
                                    value={nlpPrompt}
                                    onChange={(e) => setNlpPrompt(e.target.value)}
                                    rows="2"
                                    placeholder="e.g., We want a 3-day spiritual family tour starting from Trichy with elderly parents, relaxed pace."
                                    className="w-full p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:ring-2 focus:ring-[#8B1E2D]/40 outline-none"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. DYNAMIC RESULTS SECTION */}
                <div id="plan-results" className="scroll-mt-6">

                {/* MODE A: IDEAS MODE (Default) */}
                {mode === 'ideas' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-serif font-black text-[var(--text)] tracking-tight">
                                    Top Trip Ideas for Your Budget
                                </h2>
                                <p className="text-xs text-[var(--muted)] mt-0.5">
                                    Calculated using distance matrix and live pricing baselines for {adults + children} travelers
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleShareIdeas}
                                    className="gap-1.5"
                                >
                                    <Share2 className="w-3.5 h-3.5" />
                                    <span>{shareUrl ? 'Link Copied!' : 'Share with Trip Mates'}</span>
                                </Button>
                            </div>
                        </div>

                        {/* Low Budget Notice if applicable */}
                        {budgetGuidance && (
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong className="font-bold">Honest Budget Advice: </strong>
                                    {budgetGuidance}
                                </div>
                            </div>
                        )}

                        {/* Surprise Me Top Pick */}
                        {surpriseMe && (
                            <div className="p-5 rounded-3xl bg-gradient-to-r from-[#8B1E2D]/10 to-amber-500/10 border border-[#8B1E2D]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#8B1E2D] text-white">
                                        <Sparkles className="w-3 h-3" />
                                        <span>Surprise Me — Best Value Pick</span>
                                    </div>
                                    <div className="text-base font-serif font-black text-[var(--text)]">
                                        {surpriseMe.title} ({surpriseMe.days} Days)
                                    </div>
                                    <div className="text-xs text-[var(--muted)]">
                                        {surpriseMe.destination} · Est: ₹{Number(surpriseMe.cost_total).toLocaleString('en-IN')} total (₹{Number(surpriseMe.cost_per_person).toLocaleString('en-IN')}/person)
                                    </div>
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleCustomizeCircuit(surpriseMe)}
                                    className="gap-1.5"
                                >
                                    <span>Customize This Plan</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        )}

                        {/* Idea Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {ideasState.map((idea) => (
                                <div
                                    key={idea.id}
                                    className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-6"
                                >
                                    <div className="space-y-3.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-[var(--text)] border border-[var(--border)]">
                                                    {idea.days} Days
                                                </span>
                                                <h3 className="text-lg font-serif font-black text-[var(--text)] mt-1.5">
                                                    {idea.title}
                                                </h3>
                                                <p className="text-xs text-[var(--muted)]">{idea.destination}</p>
                                            </div>
                                            <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                                                {idea.best_season.split('(')[0]}
                                            </span>
                                        </div>

                                        {/* Why it fits */}
                                        <div className="p-3 rounded-2xl bg-[#8B1E2D]/5 dark:bg-[#8B1E2D]/10 border border-[#8B1E2D]/15 text-xs text-[var(--text)] flex items-start gap-2">
                                            <Sparkles className="w-3.5 h-3.5 text-[#8B1E2D] dark:text-[#E7A8AF] flex-shrink-0 mt-0.5" />
                                            <span>{idea.why_it_fits}</span>
                                        </div>

                                        {/* Highlights */}
                                        <div className="text-xs text-[var(--muted)] leading-relaxed">
                                            <strong className="text-[var(--text)]">Highlights: </strong>
                                            {idea.highlights}
                                        </div>
                                    </div>

                                    {/* Cost & CTA Buttons */}
                                    <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <div className="text-[11px] text-[var(--muted)]">Est. cost per person</div>
                                            <div className="text-lg font-black text-[var(--text)]">
                                                ₹{Number(idea.cost_per_person).toLocaleString('en-IN')}
                                                <span className="text-xs font-normal text-[var(--muted)] ml-1">
                                                    (₹{Number(idea.cost_total).toLocaleString('en-IN')} total)
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link href={`/packages`}>
                                                <Button variant="secondary" size="sm">
                                                    See Packages
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleCustomizeCircuit(idea)}
                                                className="gap-1"
                                            >
                                                <span>Customize</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MODE B: PLAN MY OWN TRIP (3 Plans) */}
                {mode === 'own_trip' && (
                    <div className="space-y-6">
                        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-6">
                            <div>
                                <h2 className="text-xl font-serif font-black text-[var(--text)] tracking-tight">
                                    Trip Logistics & Destinations
                                </h2>
                                <p className="text-xs text-[var(--muted)] mt-0.5">
                                    Configure your starting city, dates, and customize your stopover destinations
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">Starting City</label>
                                    <select
                                        value={startPlace}
                                        onChange={(e) => setStartPlace(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm font-semibold text-[var(--text)] outline-none focus:ring-2 focus:ring-[#8B1E2D]/40"
                                    >
                                        {COMMON_START_CITIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm font-semibold text-[var(--text)] outline-none focus:ring-2 focus:ring-[#8B1E2D]/40"
                                    />
                                </div>
                            </div>

                            {/* Destination Badges / Selector */}
                            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                                        Selected Destinations ({selectedDestinations.length})
                                    </label>
                                    <span className="text-[11px] text-[var(--muted)]">
                                        Tap to add or remove stopovers
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(defaultDestinationsByRegion[region] || defaultDestinationsByRegion.inside_tn).map((dest) => {
                                        const isSel = selectedDestinations.includes(dest);
                                        return (
                                            <button
                                                key={dest}
                                                type="button"
                                                onClick={() => toggleDestination(dest)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                                                    isSel
                                                        ? 'bg-[#8B1E2D] text-white border-[#8B1E2D] shadow-sm'
                                                        : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text)] hover:border-[#8B1E2D]/40'
                                                }`}
                                            >
                                                <MapPin className="w-3 h-3" />
                                                <span>{dest}</span>
                                                {isSel && <Check className="w-3 h-3 ml-0.5" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Collapsible Fine-Tune Section */}
                            <div className="border-t border-[var(--border)] pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowFineTune(!showFineTune)}
                                    className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer"
                                >
                                    <SlidersHorizontal className="w-3.5 h-3.5" />
                                    <span>{showFineTune ? 'Close Vehicle & Stay Settings' : 'Fine-Tune Stay Quality, Vehicle & Guide Options'}</span>
                                    {showFineTune ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>

                                {showFineTune && (
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)]">
                                        <div>
                                            <label className="block text-xs font-semibold text-[var(--text)] mb-1">Stay Level</label>
                                            <select
                                                value={customStay}
                                                onChange={(e) => setCustomStay(e.target.value)}
                                                className="w-full p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text)]"
                                            >
                                                <option value="budget">Budget Stay (Clean Homestays)</option>
                                                <option value="balanced">Balanced (3-Star Rated Hotels)</option>
                                                <option value="comfort">Comfort (4-Star Premium Resorts)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-[var(--text)] mb-1">Vehicle Selection</label>
                                            <select
                                                value={customTransport}
                                                onChange={(e) => setCustomTransport(e.target.value)}
                                                className="w-full p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text)]"
                                            >
                                                <option value="">Auto (Chosen by group size: {adults + children} pax)</option>
                                                <option value="transit">🚆 Public Transit (TNSTC Bus / Express Train - Lowest Cost)</option>
                                                <option value="bike">🛵 Bike / Scooter Rental (Self-Drive Solo/Couple)</option>
                                                <option value="sedan">🚗 Private AC Sedan (Dzire / Etios with Driver)</option>
                                                <option value="suv">🚙 Spacious AC SUV (Ertiga / Carens)</option>
                                                <option value="tempo">🚐 Tempo Traveller (7–12 Pax)</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-2 pt-6">
                                            <input
                                                type="checkbox"
                                                id="guideCheck"
                                                checked={customGuide}
                                                onChange={(e) => setCustomGuide(e.target.checked)}
                                                className="rounded border-[var(--border)] text-[#8B1E2D] focus:ring-[#8B1E2D]"
                                            />
                                            <label htmlFor="guideCheck" className="text-xs font-semibold text-[var(--text)] cursor-pointer">
                                                Include Certified Tour Guide
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Calculating loader */}
                        {isCalculatingPlan && (
                            <div className="p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] text-center space-y-3 animate-pulse">
                                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#8B1E2D]" />
                                <div className="text-sm font-bold text-[var(--text)]">
                                    Calculating 3 Plan Tiers & Live Driving Route...
                                </div>
                                <div className="text-xs text-[var(--muted)]">
                                    Evaluating distance matrix for {startPlace} → {selectedDestinations.join(' → ')}
                                </div>
                            </div>
                        )}

                        {/* Live Feasibility & Budget Guidance Meter */}
                        {!isCalculatingPlan && planData?.feasibility && (
                            <div className={`p-5 rounded-3xl border flex flex-col gap-3 ${
                                planData.feasibility.status === 'comfortable'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-950 dark:text-emerald-200'
                                    : planData.feasibility.status === 'tight'
                                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-950 dark:text-amber-200'
                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-950 dark:text-rose-200'
                            }`}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                                            planData.feasibility.status === 'comfortable'
                                                ? 'bg-emerald-600 text-white'
                                                : planData.feasibility.status === 'tight'
                                                ? 'bg-amber-600 text-white'
                                                : 'bg-rose-600 text-white'
                                        }`}>
                                            Feasibility: {planData.feasibility.label || planData.feasibility.status} ({planData.feasibility.percent ?? (planData.feasibility.score ?? 80)}%)
                                        </span>
                                        <span className="text-xs font-semibold">
                                            Est. Circuit: {planData.route_summary?.total_distance_km || planData.total_distance_km || 450} km (~{planData.route_summary?.drive_time_hours || planData.daily_driving_hours || 3.5} hrs driving total)
                                        </span>
                                    </div>

                                    {planData.advisories && planData.advisories.length > 0 && (
                                        <div className="text-xs bg-white/60 dark:bg-black/20 px-3 py-1.5 rounded-xl border border-current/15 max-w-sm">
                                            <strong className="font-bold">Permit Notice: </strong>
                                            {planData.advisories[0].title || 'Interstate tourist tax & permits handled by verified operator.'}
                                        </div>
                                    )}
                                </div>

                                <p className="text-xs font-medium leading-relaxed">
                                    {planData.feasibility.message || planData.feasibility.advice || planData.feasibility.notes || 'Your budget fits this customized circuit nicely.'}
                                </p>

                                {planData.feasibility.suggestions && planData.feasibility.suggestions.length > 0 && (
                                    <div className="pt-2 border-t border-current/10 flex flex-wrap gap-2 text-[11px]">
                                        <strong className="font-bold">💡 Optimization Tips:</strong>
                                        {planData.feasibility.suggestions.map((sug, sIdx) => (
                                            <span key={sIdx} className="bg-white/40 dark:bg-black/20 px-2 py-0.5 rounded-md">
                                                • {sug}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3 Plans Comparison Cards */}
                        {!isCalculatingPlan && planData?.plans && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {Object.entries(planData.plans).map(([tierKey, plan]) => {
                                        const isSelected = selectedTier === tierKey;
                                        const totalAmt = plan.cost_breakdown?.total ?? (plan.total_cost ?? 0);
                                        const perPersonAmt = plan.cost_breakdown?.per_person ?? (plan.cost_per_person ?? 0);

                                        return (
                                            <div
                                                key={tierKey}
                                                onClick={() => setSelectedTier(tierKey)}
                                                className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between gap-6 ${
                                                    isSelected
                                                        ? 'bg-[var(--card)] border-[#8B1E2D] shadow-xl ring-2 ring-[#8B1E2D]'
                                                        : 'bg-[var(--card)] border-[var(--border)] hover:border-[#8B1E2D]/40'
                                                }`}
                                            >
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                                                            {tierKey} Option
                                                        </span>
                                                        {isSelected && (
                                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8B1E2D] text-white">
                                                                Selected
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <h3 className="text-xl font-serif font-black text-[var(--text)]">
                                                            {plan.title || plan.tier_name || `${tierKey.toUpperCase()} Plan`}
                                                        </h3>
                                                        <p className="text-xs text-[var(--muted)] mt-1">
                                                            {plan.tagline || 'Custom verified itinerary'}
                                                        </p>
                                                    </div>

                                                    <div className="text-2xl font-black text-[var(--text)]">
                                                        ₹{Number(totalAmt).toLocaleString('en-IN')}
                                                        <span className="text-xs font-normal text-[var(--muted)] block mt-0.5">
                                                            ₹{Number(perPersonAmt).toLocaleString('en-IN')} / traveler ({adults + children} pax)
                                                        </span>
                                                    </div>

                                                    {/* Inclusions */}
                                                    <div className="space-y-2 text-xs text-[var(--muted)] pt-3 border-t border-[var(--border)]">
                                                        <div className="flex items-center gap-2">
                                                            <Car className="w-3.5 h-3.5 text-[#8B1E2D] dark:text-[#E7A8AF] flex-shrink-0" />
                                                            <span className="font-semibold text-[var(--text)]">{plan.transport_description || 'AC Vehicle with Driver'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Hotel className="w-3.5 h-3.5 text-[#8B1E2D] dark:text-[#E7A8AF] flex-shrink-0" />
                                                            <span className="font-semibold text-[var(--text)]">{plan.stay_description || plan.accommodation_description || 'Verified Stays'}</span>
                                                        </div>

                                                        {plan.inclusions && (
                                                            <div className="pt-2 space-y-1">
                                                                {plan.inclusions.slice(0, 3).map((inc, i) => (
                                                                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                                                                        <span className="truncate">{inc}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button
                                                    variant={isSelected ? 'primary' : 'secondary'}
                                                    className="w-full"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTier(tierKey);
                                                        handleSubmitCustomTrip();
                                                    }}
                                                >
                                                    {isSelected ? 'Submit Custom Trip Request' : 'Select This Plan'}
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* DAY-BY-DAY ITINERARY DETAIL */}
                                {planData.plans[selectedTier]?.itinerary && (
                                    <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-serif font-black text-[var(--text)]">
                                                    Calculated Day-by-Day Route & Stops ({selectedTier.toUpperCase()} Plan)
                                                </h3>
                                                <p className="text-xs text-[var(--muted)] mt-0.5">
                                                    Starting from {startPlace} · Optimized for comfortable driving times
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {planData.plans[selectedTier].itinerary.map((dayItem, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                                                >
                                                    <div className="space-y-1.5 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#8B1E2D] text-white">
                                                                Day {dayItem.day_number || idx + 1}
                                                            </span>
                                                            <h4 className="font-bold text-sm text-[var(--text)]">
                                                                {dayItem.title || `Day ${idx + 1}: ${dayItem.location || 'Exploring Destination'}`}
                                                            </h4>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                                            {(dayItem.places || []).map((pl, pIdx) => (
                                                                <span
                                                                    key={pIdx}
                                                                    className="px-2.5 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text)] font-medium flex items-center gap-1.5 shadow-2xs"
                                                                >
                                                                    <MapPin className="w-3 h-3 text-[#8B1E2D] shrink-0" />
                                                                    <span className="font-semibold">{pl.name || pl}</span>
                                                                    {pl.category && (
                                                                        <span className="text-[10px] uppercase font-bold text-[#8B1E2D] bg-[#8B1E2D]/10 px-1.5 py-0.5 rounded">
                                                                            {pl.category.replace('_', ' ')}
                                                                        </span>
                                                                    )}
                                                                    {pl.time_slot && (
                                                                        <span className="text-[10px] text-[var(--muted)]">({pl.time_slot.split(' ')[0]})</span>
                                                                    )}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="text-xs text-[var(--muted)]">
                                                Ready to receive quotes from licensed verified tour operators for this itinerary?
                                            </div>
                                            <Button
                                                variant="primary"
                                                onClick={handleSubmitCustomTrip}
                                                className="w-full sm:w-auto"
                                            >
                                                Submit Custom Request to Operators →
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* MODE C: READY-MADE PACKAGES */}
                {mode === 'packages' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-serif font-black text-[var(--text)] tracking-tight">
                                    Verified Packages with Fixed Departures
                                </h2>
                                <p className="text-xs text-[var(--muted)] mt-0.5">
                                    Browse verified partner itineraries or create your own custom itinerary below
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {readyPackages.map((pkg) => {
                                const nextDep = pkg.package_departures?.[0];
                                return (
                                    <div
                                        key={pkg.id}
                                        className="rounded-3xl bg-[var(--card)] border border-[var(--border)] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                                    >
                                        <div className="aspect-[16/10] bg-stone-200 dark:bg-stone-800 relative overflow-hidden">
                                            {pkg.primary_photo_url ? (
                                                <img src={pkg.primary_photo_url} alt={pkg.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-[var(--muted)]">
                                                    <Compass className="w-8 h-8 opacity-40 text-[#8B1E2D]" />
                                                </div>
                                            )}
                                            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#8B1E2D] text-white shadow-sm">
                                                From ₹{Number(pkg.price_per_person || pkg.price).toLocaleString('en-IN')}
                                            </span>
                                        </div>

                                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-sm text-[var(--text)] line-clamp-2">
                                                    {pkg.title}
                                                </h3>
                                                <p className="text-xs text-[var(--muted)] mt-1">
                                                    By {pkg.vendor?.business_name || 'Verified Partner'}
                                                </p>
                                            </div>

                                            <div className="pt-3 border-t border-[var(--border)]">
                                                {nextDep ? (
                                                    <div className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold mb-2">
                                                        Next: {nextDep.date} ({nextDep.seats_left} seats left)
                                                    </div>
                                                ) : (
                                                    <div className="text-[11px] text-[var(--muted)] mb-2">
                                                        Departures on request
                                                    </div>
                                                )}
                                                <Link href={`/packages/${pkg.id}`}>
                                                    <Button variant="secondary" size="sm" className="w-full">
                                                        View Tour Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bottom Action if not found */}
                        <div className="p-8 rounded-3xl bg-stone-100 dark:bg-stone-800/40 text-center space-y-3">
                            <h3 className="text-lg font-serif font-black text-[var(--text)]">
                                Didn't find the exact package you need?
                            </h3>
                            <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
                                Request a custom itinerary with your exact dates and get competitive quotes directly from verified local agencies.
                            </p>
                            <Button
                                variant="primary"
                                onClick={() => setMode('own_trip')}
                            >
                                Plan My Own Trip Instead →
                            </Button>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
