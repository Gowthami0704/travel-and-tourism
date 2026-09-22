import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import TripMateToast from '@/Components/TripMates/TripMateToast';
import {
    getTripPosts,
    getJoinRequests,
    filterActiveTrips,
    createTripPost,
    applyToTrip,
    updateJoinRequestStatus
} from '@/Utils/tripMatesStorage';
import { getImage, handleImageError, cleanName } from '@/Utils/imageFallback';
import {
    Users,
    Sparkles,
    ShieldCheck,
    MapPin,
    Calendar,
    Plus,
    Check,
    X,
    MessageSquare,
    DollarSign,
    Clock,
    Search,
    Filter,
    CheckCircle2,
    AlertCircle,
    Send,
    UserCheck,
    Tag,
    ArrowRight
} from 'lucide-react';

export default function TripMates({ districts = [] }) {
    const { auth } = usePage().props;
    const currentUser = auth?.user || { id: 1, name: 'Kavitha Ramachandran', email: 'user@tnexplore.com', phone: '+91 98401 56789' };

    const [posts, setPosts] = useState([]);
    const [requests, setRequests] = useState([]);
    const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'my-ads' | 'my-applications'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('All');

    // Post Trip Modal State
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [postForm, setPostForm] = useState({
        district: districts[0]?.name || 'Nilgiris',
        startDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        slotsNeeded: 2,
        estimatedBudget: 2800,
        description: '',
        tags: ['Photography', 'Backpacking'],
        confirmedVerified: true,
    });

    // Apply Modal State
    const [applyingTrip, setApplyingTrip] = useState(null);
    const [applyMessage, setApplyMessage] = useState('');
    const [applySuccess, setApplySuccess] = useState(false);

    // Toast State for Demo / Live updates
    const [activeToastTrip, setActiveToastTrip] = useState(null);

    // Available tags for post form
    const availableTags = ['Backpacking', 'Photography', 'Food Crawl', 'Temple Tour', 'Nature Trek', 'Road Trip', 'Budget Stay', 'Beach Sunset'];

    // Load initial posts from persistent storage
    useEffect(() => {
        const loadedPosts = getTripPosts();
        const loadedRequests = getJoinRequests();
        setPosts(loadedPosts);
        setRequests(loadedRequests);

        // Show a fun sample toast after 2 seconds for active feed demo
        const active = filterActiveTrips(loadedPosts);
        if (active.length > 0) {
            const timer = setTimeout(() => {
                const sample = active.find((p) => p.creatorId !== currentUser.id) || active[0];
                setActiveToastTrip(sample);
            }, 1800);
            return () => clearTimeout(timer);
        }
    }, []);

    // Filter Active Feed (Auto-expires past trips)
    const activeTrips = useMemo(() => {
        return filterActiveTrips(posts).filter((p) => {
            const matchesSearch =
                p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRegion = selectedRegion === 'All' || p.districtRegion === selectedRegion;
            return matchesSearch && matchesRegion;
        });
    }, [posts, searchQuery, selectedRegion]);

    // My Created Trip Ads
    const myTripAds = useMemo(() => {
        return posts.filter((p) => p.creatorId === currentUser.id || p.creatorName === currentUser.name);
    }, [posts, currentUser]);

    // My Submitted Applications
    const myApplications = useMemo(() => {
        return requests.filter((r) => r.userId === currentUser.id || r.userName === currentUser.name);
    }, [requests, currentUser]);

    // Tag Toggle
    const handleTagToggle = (tag) => {
        setPostForm((prev) => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter((t) => t !== tag)
                : [...prev.tags, tag]
        }));
    };

    // Handle Create Trip Submit
    const handleCreateTripSubmit = (e) => {
        e.preventDefault();
        const distObj = districts.find((d) => d.name === postForm.district);
        const newPost = createTripPost({
            ...postForm,
            districtRegion: distObj?.region || 'Tamil Nadu'
        }, currentUser);

        const updated = getTripPosts();
        setPosts(updated);
        setIsPostModalOpen(false);
        setActiveTab('feed');

        // Trigger toast for the new ad
        setActiveToastTrip(newPost);
    };

    // Handle Apply Submit
    const handleApplySubmit = (e) => {
        e.preventDefault();
        if (!applyingTrip) return;

        const res = applyToTrip(applyingTrip.id, currentUser, applyMessage);
        if (res.success) {
            setRequests(getJoinRequests());
            setApplySuccess(true);
            setTimeout(() => {
                setApplySuccess(false);
                setApplyingTrip(null);
                setApplyMessage('');
            }, 1800);
        } else {
            alert(res.message);
        }
    };

    // Handle Accept/Reject Join Request
    const handleUpdateApplicant = (requestId, newStatus) => {
        updateJoinRequestStatus(requestId, newStatus);
        setRequests(getJoinRequests());
        setPosts(getTripPosts());
    };

    return (
        <MainLayout>
            <Head title="Trip Mates Hub — Find Travel Companions in Tamil Nadu | TN Explore" />

            {/* Bottom-Right Floating Toast Notification */}
            {activeToastTrip && (
                <TripMateToast
                    trip={activeToastTrip}
                    currentUser={currentUser}
                    onDismiss={() => setActiveToastTrip(null)}
                    onJoined={() => setRequests(getJoinRequests())}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* HERO SOCIAL BANNER */}
                <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0E1528] via-[#161F3C] to-[#0B1120] border-2 border-purple-500/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative z-10 max-w-2xl">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-gold" />
                                Community Travel Hub
                            </span>
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Verified Travelers Only
                            </span>
                        </div>

                        <h1 className="font-display font-black text-2xl sm:text-4xl text-white leading-tight">
                            Trip Mates Hub
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
                            Never cancel a trip due to last-minute dropouts! Post a trip ad for any of the <strong className="text-gold">38 Districts</strong>, connect with verified travel companions, and split cab, stay, and food expenses.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsPostModalOpen(true)}
                            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-gold via-amber-300 to-gold text-[#0A0E1A] font-extrabold text-xs shadow-xl shadow-gold/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Plus className="w-4 h-4 stroke-[3]" />
                            <span>Post a Trip Ad</span>
                        </button>
                    </div>
                </div>

                {/* NAVIGATION TABS (Active Feed / My Ads / My Applications) */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 gap-4 flex-wrap">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('feed')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'feed'
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                                    : 'bg-[#0E1526] text-gray-400 hover:text-white border border-white/5'
                            }`}
                        >
                            <Sparkles className="w-4 h-4 text-gold" />
                            <span>Active Open Trips ({activeTrips.length})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('my-ads')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'my-ads'
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                                    : 'bg-[#0E1526] text-gray-400 hover:text-white border border-white/5'
                            }`}
                        >
                            <UserCheck className="w-4 h-4 text-emerald-400" />
                            <span>My Trip Ads ({myTripAds.length})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('my-applications')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'my-applications'
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                                    : 'bg-[#0E1526] text-gray-400 hover:text-white border border-white/5'
                            }`}
                        >
                            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                            <span>My Applications ({myApplications.length})</span>
                        </button>
                    </div>

                    <span className="text-[11px] text-gray-400 font-medium">
                        Auto-expires on Trip Start Date ⏳
                    </span>
                </div>

                {/* ========================================================= */}
                {/* TAB 1: ACTIVE OPEN TRIPS FEED                             */}
                {/* ========================================================= */}
                {activeTab === 'feed' && (
                    <div className="space-y-6">
                        {/* SEARCH & FILTERS */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D1424] border border-white/10">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search trip ads by district (e.g. Nilgiris, Madurai, Kanyakumari), vibe, or creator..."
                                    className="w-full pl-10 pr-4 py-2 bg-[#070B14] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                                />
                            </div>

                            <div className="flex items-center gap-1.5 overflow-x-auto">
                                {['All', 'North', 'South', 'Kongu', 'Central', 'Coastal'].map((reg) => (
                                    <button
                                        key={reg}
                                        type="button"
                                        onClick={() => setSelectedRegion(reg)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                            selectedRegion === reg
                                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                                : 'bg-white/5 text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {reg}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* TRIP ADS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeTrips.map((trip) => {
                                const slotsLeft = trip.slotsNeeded - trip.slotsFilled;
                                const isCreator = trip.creatorId === currentUser.id || trip.creatorName === currentUser.name;
                                const hasApplied = requests.some((r) => r.tripPostId === trip.id && (r.userId === currentUser.id || r.userName === currentUser.name));

                                return (
                                    <div
                                        key={trip.id}
                                        className="rounded-3xl bg-[#0D1424]/90 border border-white/10 hover:border-purple-500/50 shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10 group"
                                    >
                                        {/* Card Header & District Photo */}
                                        <div className="relative h-44 w-full overflow-hidden bg-navy-lighter">
                                            <img
                                                src={getImage({ name: trip.district }, 'district')}
                                                alt={trip.district}
                                                onError={(e) => handleImageError(e, 'hills')}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0D1424] via-transparent to-black/40" />

                                            {/* District Badge */}
                                            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-xs font-bold text-white flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-gold" />
                                                <span>{trip.district} District</span>
                                            </div>

                                            {/* Slots Left Pill */}
                                            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-purple-950/80 backdrop-blur-md border border-purple-400/40 text-[11px] font-extrabold text-purple-300">
                                                {slotsLeft > 0 ? `🔥 ${slotsLeft} Slots Left` : '🎉 Slots Full'}
                                            </div>

                                            {/* Dates Banner at bottom of image */}
                                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-semibold text-gray-200">
                                                <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                                                    <Calendar className="w-3 h-3 text-gold" />
                                                    {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>

                                                {trip.estimatedBudget && (
                                                    <span className="bg-emerald-950/80 backdrop-blur-md text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-bold font-mono">
                                                        ~₹{trip.estimatedBudget}/pax
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content Area */}
                                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                            <div>
                                                {/* Creator Meta Row */}
                                                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
                                                            {trip.creatorName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-xs font-bold text-white">
                                                                    {trip.creatorName}
                                                                </span>
                                                                {trip.creatorVerified && (
                                                                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30 flex items-center gap-0.5">
                                                                        <ShieldCheck className="w-2.5 h-2.5" />
                                                                        Verified
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] text-gray-400">
                                                                Posted {new Date(trip.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                                                    "{trip.description}"
                                                </p>

                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-1.5 mt-3">
                                                    {trip.tags?.map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="text-[10px] bg-white/5 text-gray-300 px-2 py-0.5 rounded-md border border-white/10 font-medium"
                                                        >
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="pt-2">
                                                {isCreator ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveTab('my-ads')}
                                                        className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-gold text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                                    >
                                                        <UserCheck className="w-4 h-4" />
                                                        <span>Manage Applicants (Your Ad)</span>
                                                    </button>
                                                ) : hasApplied ? (
                                                    <div className="w-full py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span>Application Submitted</span>
                                                    </div>
                                                ) : slotsLeft > 0 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setApplyingTrip(trip)}
                                                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Sparkles className="w-4 h-4 text-gold" />
                                                        <span>Join Trip Mate</span>
                                                    </button>
                                                ) : (
                                                    <div className="w-full py-2.5 rounded-xl bg-gray-800 text-gray-400 text-xs font-bold text-center">
                                                        Trip Slots Full
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {activeTrips.length === 0 && (
                            <div className="p-12 text-center rounded-3xl bg-[#0D1424] border border-white/10 text-gray-400 space-y-3">
                                <Users className="w-12 h-12 text-gray-500 mx-auto" />
                                <h3 className="font-bold text-white text-base">No active trip ads found</h3>
                                <p className="text-xs max-w-sm mx-auto text-gray-400">
                                    Be the first traveler to post a trip ad and invite companions for your upcoming journey!
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIsPostModalOpen(true)}
                                    className="mt-2 px-5 py-2.5 rounded-xl bg-gold text-black text-xs font-bold"
                                >
                                    Post a Trip Ad
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB 2: ORGANIZER DASHBOARD (MY TRIP ADS & APPLICANTS)    */}
                {/* ========================================================= */}
                {activeTab === 'my-ads' && (
                    <div className="space-y-6">
                        <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/10 flex items-center justify-between">
                            <div>
                                <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-emerald-400" />
                                    Organizer Management — My Posted Trip Ads
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Review traveler applications, accept companions, and track filled seats
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsPostModalOpen(true)}
                                className="px-4 py-2 rounded-xl bg-gold text-black font-bold text-xs shadow-md hover:scale-105 transition-all cursor-pointer"
                            >
                                + Post Another Ad
                            </button>
                        </div>

                        {myTripAds.length > 0 ? (
                            <div className="space-y-6">
                                {myTripAds.map((ad) => {
                                    const adApplicants = requests.filter((r) => r.tripPostId === ad.id);
                                    const slotsLeft = ad.slotsNeeded - ad.slotsFilled;

                                    return (
                                        <div key={ad.id} className="p-6 rounded-3xl bg-[#0D1424] border border-purple-500/30 shadow-xl space-y-5">
                                            {/* Ad Summary Row */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-display font-bold text-lg text-white">
                                                            {ad.district} Exploration Trip
                                                        </h3>
                                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                                            {ad.slotsFilled} of {ad.slotsNeeded} Slots Filled
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            • 🗓️ {ad.startDate} to {ad.endDate}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-300 mt-1">"{ad.description}"</p>
                                                </div>

                                                <div className="text-left sm:text-right font-mono">
                                                    <span className="text-[11px] text-gray-400 uppercase block">Est. Budget</span>
                                                    <span className="text-sm font-bold text-gold">~₹{ad.estimatedBudget}/pax</span>
                                                </div>
                                            </div>

                                            {/* Applicants List */}
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-3 flex items-center gap-1.5">
                                                    <MessageSquare className="w-3.5 h-3.5 text-gold" />
                                                    Applicants ({adApplicants.length})
                                                </h4>

                                                {adApplicants.length > 0 ? (
                                                    <div className="space-y-2.5">
                                                        {adApplicants.map((app) => (
                                                            <div
                                                                key={app.id}
                                                                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                                            >
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-bold text-xs text-white">
                                                                            {app.userName}
                                                                        </span>
                                                                        {app.userVerified && (
                                                                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30 flex items-center gap-0.5">
                                                                                <ShieldCheck className="w-2.5 h-2.5" />
                                                                                Verified
                                                                            </span>
                                                                        )}
                                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                                                            app.status === 'accepted'
                                                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                                                                : app.status === 'rejected'
                                                                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                                                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                                                        }`}>
                                                                            {app.status}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-300 italic">
                                                                        "{app.message}"
                                                                    </p>
                                                                    <span className="text-[10px] text-gray-400 block">
                                                                        Applied on {new Date(app.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>

                                                                {/* Accept / Reject Buttons */}
                                                                <div className="flex items-center gap-2 self-start sm:self-center">
                                                                    {app.status === 'pending' && (
                                                                        <>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleUpdateApplicant(app.id, 'accepted')}
                                                                                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-md transition-all cursor-pointer"
                                                                            >
                                                                                Accept Mate
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleUpdateApplicant(app.id, 'rejected')}
                                                                                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold transition-all cursor-pointer"
                                                                            >
                                                                                Decline
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    {app.status === 'accepted' && (
                                                                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                                                            <CheckCircle2 className="w-4 h-4" />
                                                                            Confirmed in Group
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-400 italic bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                                        No applicants yet. When travelers click "Join Trip", their requests will appear here for you to accept or decline.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-10 text-center rounded-3xl bg-[#0D1424] border border-white/10 text-gray-400 space-y-2">
                                <p className="text-sm font-bold text-white">You haven't posted any trip ads yet</p>
                                <p className="text-xs">Post an upcoming trip to find verified companions to travel with!</p>
                                <button
                                    type="button"
                                    onClick={() => setIsPostModalOpen(true)}
                                    className="mt-3 px-4 py-2 rounded-xl bg-gold text-black text-xs font-bold"
                                >
                                    Post Your First Trip Ad
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================================= */}
                {/* TAB 3: MY APPLICATIONS                                    */}
                {/* ========================================================= */}
                {activeTab === 'my-applications' && (
                    <div className="space-y-4">
                        <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/10">
                            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                                Trips I've Applied To ({myApplications.length})
                            </h2>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Track confirmation status from trip organizers across Tamil Nadu
                            </p>
                        </div>

                        {myApplications.length > 0 ? (
                            <div className="space-y-3">
                                {myApplications.map((app) => {
                                    const relatedPost = posts.find((p) => p.id === app.tripPostId);
                                    return (
                                        <div
                                            key={app.id}
                                            className="p-4 rounded-2xl bg-[#0D1424] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-sm text-white">
                                                        {relatedPost ? `${relatedPost.district} Trip` : 'Travel Companion Ad'}
                                                    </h3>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                                        app.status === 'accepted'
                                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                                            : app.status === 'rejected'
                                                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                                    }`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400">
                                                    Organizer: <strong className="text-gray-200">{relatedPost?.creatorName || 'Fellow Traveler'}</strong> • Start Date: {relatedPost?.startDate}
                                                </p>
                                                <p className="text-xs text-gray-300 italic">
                                                    Your Message: "{app.message}"
                                                </p>
                                            </div>

                                            <div className="text-xs font-bold text-purple-300">
                                                {app.status === 'accepted' ? '🎉 You are in the trip squad!' : 'Awaiting Organizer Confirmation'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-10 text-center rounded-3xl bg-[#0D1424] border border-white/10 text-gray-400 space-y-2">
                                <p className="text-sm font-bold text-white">No applications yet</p>
                                <p className="text-xs">Browse the active trip feed and apply to join journeys that match your vibe!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ========================================================= */}
            {/* MODAL 1: POST A TRIP AD                                   */}
            {/* ========================================================= */}
            {isPostModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0D1424] border-2 border-purple-500/40 p-6 sm:p-8 shadow-2xl text-white space-y-5">
                        <button
                            type="button"
                            onClick={() => setIsPostModalOpen(false)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-white cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">
                                <Sparkles className="w-3.5 h-3.5 text-gold" />
                                <span>Create Travel Companion Ad</span>
                            </div>
                            <h3 className="font-display font-bold text-2xl text-white">
                                Post a Trip & Find Mates
                            </h3>
                            <p className="text-xs text-gray-300 mt-1">
                                Broadcast your travel plans across Tamil Nadu to connect with verified companions.
                            </p>
                        </div>

                        <form onSubmit={handleCreateTripSubmit} className="space-y-4">
                            {/* Destination District */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-gold" />
                                    Destination District (38 Options)
                                </label>
                                <select
                                    value={postForm.district}
                                    onChange={(e) => setPostForm({ ...postForm, district: e.target.value })}
                                    className="w-full py-2.5 px-3.5 bg-[#070B14] border border-white/15 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-purple-400 cursor-pointer"
                                    required
                                >
                                    {districts.map((d) => (
                                        <option key={d.id} value={d.name} className="bg-[#0A0E1A]">
                                            {d.name} ({d.region} TN)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Dates Row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-gold" />
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={postForm.startDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setPostForm({ ...postForm, startDate: e.target.value })}
                                        className="w-full py-2 px-3 bg-[#070B14] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-gold" />
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={postForm.endDate}
                                        min={postForm.startDate}
                                        onChange={(e) => setPostForm({ ...postForm, endDate: e.target.value })}
                                        className="w-full py-2 px-3 bg-[#070B14] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Slots Needed & Estimated Budget */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1 flex items-center gap-1">
                                        <Users className="w-3 h-3 text-purple-400" />
                                        Slots Needed (Mates)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="8"
                                        value={postForm.slotsNeeded}
                                        onChange={(e) => setPostForm({ ...postForm, slotsNeeded: e.target.value })}
                                        className="w-full py-2 px-3 bg-[#070B14] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1 flex items-center gap-1">
                                        <DollarSign className="w-3 h-3 text-gold" />
                                        Est. Budget/Person (₹)
                                    </label>
                                    <input
                                        type="number"
                                        step="100"
                                        value={postForm.estimatedBudget}
                                        onChange={(e) => setPostForm({ ...postForm, estimatedBudget: e.target.value })}
                                        className="w-full py-2 px-3 bg-[#070B14] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Trip Vibe Tags */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5 flex items-center gap-1">
                                    <Tag className="w-3 h-3 text-gold" />
                                    Select Trip Vibe & Tags
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {availableTags.map((tag) => {
                                        const isSelected = postForm.tags.includes(tag);
                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => handleTagToggle(tag)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-purple-600 text-white shadow-md'
                                                        : 'bg-[#070B14] text-gray-400 hover:text-white border border-white/10'
                                                }`}
                                            >
                                                #{tag}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Trip Description */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                                    Trip Plan Details & Expectations
                                </label>
                                <textarea
                                    rows="3"
                                    value={postForm.description}
                                    placeholder="e.g. Planning a weekend photography & tea estate trek in Ooty. Splitting cab from Coimbatore and homestay. Looking for fun travel mates!"
                                    onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-[#070B14] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                                    required
                                />
                            </div>

                            {/* Trust & Safety Confirmation Gate */}
                            <label className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={postForm.confirmedVerified}
                                    onChange={(e) => setPostForm({ ...postForm, confirmedVerified: e.target.checked })}
                                    className="mt-0.5 rounded bg-[#0A0E1A] border-emerald-500/40 text-emerald-400 focus:ring-emerald-400"
                                    required
                                />
                                <div className="text-[11px] text-gray-300">
                                    <strong className="text-emerald-300 block font-semibold flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Verified Traveler Community Safety
                                    </strong>
                                    <span>I confirm I am a verified traveler with contact details on file and will maintain safety standards for all group companions.</span>
                                </div>
                            </label>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!postForm.confirmedVerified}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-gold via-amber-300 to-gold text-[#0A0E1A] font-extrabold text-xs shadow-xl shadow-gold/25 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <Sparkles className="w-4 h-4 fill-current" />
                                <span>Publish Trip Ad & Broadcast to Community</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 2: APPLY TO JOIN TRIP                               */}
            {/* ========================================================= */}
            {applyingTrip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-md rounded-3xl bg-[#0D1424] border-2 border-purple-500/40 p-6 shadow-2xl text-white space-y-4">
                        <button
                            type="button"
                            onClick={() => setApplyingTrip(null)}
                            className="absolute top-5 right-5 text-gray-400 hover:text-white cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div>
                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
                                Join Request
                            </span>
                            <h3 className="font-display font-bold text-xl text-white">
                                Apply to Join {applyingTrip.district} Trip
                            </h3>
                            <p className="text-xs text-gray-300 mt-0.5">
                                Organizer: <strong className="text-gold">{applyingTrip.creatorName}</strong>
                            </p>
                        </div>

                        {applySuccess ? (
                            <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center text-emerald-300 space-y-2 animate-fadeIn">
                                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                                <h4 className="font-bold text-sm text-white">Application Sent!</h4>
                                <p className="text-xs text-gray-300">
                                    {applyingTrip.creatorName} has received your request and will review your verified profile.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleApplySubmit} className="space-y-4">
                                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-gray-300 space-y-1">
                                    <div className="flex justify-between text-gray-400 text-[11px]">
                                        <span>🗓️ Dates:</span>
                                        <span className="text-white font-medium">{applyingTrip.startDate} to {applyingTrip.endDate}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400 text-[11px]">
                                        <span>💰 Est. Split:</span>
                                        <span className="text-gold font-bold font-mono">~₹{applyingTrip.estimatedBudget}/pax</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                                        Introduce Yourself to {applyingTrip.creatorName}
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={applyMessage}
                                        onChange={(e) => setApplyMessage(e.target.value)}
                                        placeholder="Hey! I love photography and hiking. Would love to join your trip."
                                        className="w-full px-3 py-2 bg-[#070B14] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-purple-400"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Send Join Request</span>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
