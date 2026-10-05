import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    Send, ArrowLeft, Building2, User, Shield, CheckCircle2, 
    IndianRupee, MapPin, Calendar, Clock, Check, Sparkles, 
    Edit3, X, FileText, AlertCircle, RefreshCw, Car, Hotel, 
    Award, ShieldCheck, Plus, CheckCircle, Tag, Bell, MessageSquare,
    Phone, MessageCircle
} from 'lucide-react';

const COMMON_INCLUSIONS = [
    'AC Cab with Private Chauffeur',
    'Toll, Parking & Fuel Included',
    'Driver Bata & Food Allowance',
    'Daily Buffet Breakfast',
    'Temple / Sightseeing Guided Tour',
    '3-Star Deluxe Hotel Stay',
    '4-Star Luxury Resort Stay',
    'Monument Entry Fast-Track Pass',
    '24/7 On-Trip Emergency Support'
];

export default function TripChatRoom({ auth, chat, currentUserId, currentUserRole }) {
    const messagesEndRef = useRef(null);
    const lastSeenMessageIdRef = useRef(null);
    const [incomingPopup, setIncomingPopup] = useState(null);
    const [revisedModalOpen, setRevisedModalOpen] = useState(false);
    const [revisedPrice, setRevisedPrice] = useState(chat.proposal?.quote_price || 10000);
    const [revisedVehicle, setRevisedVehicle] = useState('AC Sedan (Dzire / Etios)');
    const [revisedHotel, setRevisedHotel] = useState('3-Star Deluxe Heritage Stay');
    const [selectedInclusions, setSelectedInclusions] = useState(
        Array.isArray(chat.proposal?.inclusions) && chat.proposal.inclusions.length > 0 
            ? chat.proposal.inclusions 
            : ['AC Cab with Private Chauffeur', 'Toll, Parking & Fuel Included', 'Daily Buffet Breakfast']
    );
    const [customInclusionInput, setCustomInclusionInput] = useState('');
    const [revisedNote, setRevisedNote] = useState('');
    const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
    const [acceptingMsgId, setAcceptingMsgId] = useState(null);

    const { data, setData, post, processing, reset } = useForm({
        message: '',
        attachment_url: '',
    });

    const playNotificationChime = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5
            gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.35);
        } catch (e) {}
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Watch incoming messages for live popup notifications
    useEffect(() => {
        if (!chat.messages || chat.messages.length === 0) return;

        const latestMsg = chat.messages[chat.messages.length - 1];

        // On first mount, set initial marker
        if (lastSeenMessageIdRef.current === null) {
            lastSeenMessageIdRef.current = latestMsg.id;
            scrollToBottom();
            return;
        }

        // When a NEW message arrives from the other person
        if (latestMsg.id !== lastSeenMessageIdRef.current) {
            lastSeenMessageIdRef.current = latestMsg.id;
            scrollToBottom();

            if (latestMsg.sender_id !== currentUserId) {
                playNotificationChime();
                const senderName = latestMsg.sender?.name || (latestMsg.sender_role === 'vendor' ? 'Vendor' : 'Tourist');
                setIncomingPopup({
                    id: latestMsg.id,
                    senderName: senderName,
                    senderRole: latestMsg.sender_role,
                    message: latestMsg.message,
                    payload: latestMsg.custom_quote_payload,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                });

                // Auto-dismiss after 6 seconds
                const timer = setTimeout(() => {
                    setIncomingPopup(null);
                }, 6000);
                return () => clearTimeout(timer);
            }
        }
    }, [chat.messages, currentUserId]);

    // Polling for live chat updates every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['chat'], preserveScroll: true });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!data.message.trim()) return;

        post(route('trip-chats.messages.store', chat.id), {
            onSuccess: () => reset('message'),
            preserveScroll: true,
        });
    };

    const toggleInclusion = (item) => {
        if (selectedInclusions.includes(item)) {
            setSelectedInclusions(selectedInclusions.filter(i => i !== item));
        } else {
            setSelectedInclusions([...selectedInclusions, item]);
        }
    };

    const addCustomInclusion = (e) => {
        e?.preventDefault();
        const trimmed = customInclusionInput.trim();
        if (trimmed && !selectedInclusions.includes(trimmed)) {
            setSelectedInclusions([...selectedInclusions, trimmed]);
            setCustomInclusionInput('');
        }
    };

    const handleSendRevisedOffer = (e) => {
        e.preventDefault();
        if (selectedInclusions.length === 0) {
            alert('Please select at least one package inclusion.');
            return;
        }

        setIsSubmittingQuote(true);
        router.post(route('trip-chats.quote.store', chat.id), {
            price: parseFloat(revisedPrice),
            vehicle_model: revisedVehicle,
            hotel_category: revisedHotel,
            inclusions: selectedInclusions,
            notes: revisedNote,
        }, {
            onSuccess: () => {
                setRevisedModalOpen(false);
                setRevisedNote('');
                setIsSubmittingQuote(false);
            },
            onError: () => {
                setIsSubmittingQuote(false);
            },
            preserveScroll: true,
        });
    };

    const [selectedQuoteToConfirm, setSelectedQuoteToConfirm] = useState(null);

    const handleOpenConfirmModal = (messageId, quotePrice, payload) => {
        setSelectedQuoteToConfirm({
            messageId,
            price: quotePrice,
            payload: payload || {},
        });
    };

    const handleConfirmQuoteBooking = () => {
        if (!selectedQuoteToConfirm) return;
        setAcceptingMsgId(selectedQuoteToConfirm.messageId);
        router.post(route('trip-chats.accept-quote', [chat.id, selectedQuoteToConfirm.messageId]), {}, {
            onFinish: () => {
                setAcceptingMsgId(null);
                setSelectedQuoteToConfirm(null);
            },
            preserveScroll: true,
        });
    };

    const handleAcceptBaseProposal = () => {
        if (!chat.proposal) return;
        setSelectedQuoteToConfirm({
            messageId: 'base_proposal',
            price: chat.proposal.quote_price,
            payload: {
                inclusions: chat.proposal.inclusions || [],
                vehicle_model: chat.proposal.vehicle_details || 'Dedicated AC Transport',
                hotel_category: chat.proposal.hotel_details || 'Verified Hotel / Homestay',
                notes: chat.proposal.vendor_message,
            },
            isBaseProposal: true,
        });
    };

    const isTourist = currentUserRole === 'tourist' || currentUserRole === 'user';
    const isVendor = currentUserRole === 'vendor';
    const trip = chat.custom_trip;
    const proposal = chat.proposal;
    const isBooked = trip?.status === 'booked';
    const vendorTrustScore = Math.round((chat.vendor?.trust_score || 0.85) * 100);

    return (
        <div className="min-h-screen bg-[#FFFDF7] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans relative">
            <Head title={`Trip Chat with ${isVendor ? chat.tourist?.name : chat.vendor?.business_name}`} />

            {/* FLOATING LIVE INCOMING MESSAGE POPUP TOAST */}
            {incomingPopup && (
                <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-bounce-in">
                    <div className="p-4 rounded-2xl bg-white/95 dark:bg-stone-900/95 border-2 border-amber-500/60 shadow-2xl backdrop-blur-xl text-stone-900 dark:text-white space-y-2.5">
                        <div className="flex items-center justify-between gap-2 border-b border-[#E6D5B8] dark:border-stone-800 pb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center text-amber-800 dark:text-amber-400">
                                    <Bell className="w-4 h-4 animate-swing" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-extrabold text-xs text-stone-900 dark:text-white truncate max-w-[140px]">
                                            {incomingPopup.senderName}
                                        </span>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                            incomingPopup.senderRole === 'vendor'
                                                ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40'
                                                : 'bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/40'
                                        }`}>
                                            {incomingPopup.senderRole === 'vendor' ? '🏢 Vendor' : '👤 Tourist'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-stone-500 dark:text-stone-400 block">{incomingPopup.time}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIncomingPopup(null)}
                                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="text-xs text-stone-700 dark:text-stone-300 line-clamp-3 bg-[#FAF7F0] dark:bg-stone-950 p-2.5 rounded-xl border border-[#E6D5B8] dark:border-stone-800">
                            {incomingPopup.payload ? (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-maroon-800 dark:text-amber-400 font-bold">
                                        <Sparkles className="w-3 h-3" />
                                        <span>New Revised Quotation: ₹{Number(incomingPopup.payload.price).toLocaleString()}</span>
                                    </div>
                                    {incomingPopup.message && <p className="text-stone-600 dark:text-stone-300 text-[11px]">{incomingPopup.message}</p>}
                                </div>
                            ) : (
                                <p className="text-maroon-800 dark:text-amber-300 italic font-medium">
                                    "{incomingPopup.message}"
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 animate-ping" />
                                New Message Received
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    scrollToBottom();
                                    setIncomingPopup(null);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-maroon-800 text-white font-bold text-[11px] hover:bg-maroon-900 cursor-pointer shadow-xs"
                            >
                                View Down ↓
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Top Bar */}
            <header className="border-b border-[#E6D5B8] dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl px-4 sm:px-6 py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                    <Link 
                        href={isTourist ? route('custom-trips.show', chat.custom_trip_id) : route('trip-chats.index')} 
                        className="p-2 rounded-xl bg-[#FAF7F0] dark:bg-stone-800 hover:bg-[#E6D5B8]/60 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors border border-[#E6D5B8] dark:border-stone-700 cursor-pointer"
                        title="Back"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FAF7F0] dark:bg-stone-800 border border-[#E6D5B8] dark:border-stone-700 flex items-center justify-center font-bold text-maroon-800 dark:text-amber-400 shrink-0">
                            {isVendor ? <User className="w-5 h-5 text-stone-600 dark:text-stone-300" /> : <Building2 className="w-5 h-5 text-maroon-800 dark:text-amber-400" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                                    {isVendor ? (chat.tourist?.name || 'Tourist') : (chat.vendor?.business_name || 'Vendor')}
                                </h2>
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Online"></span>
                                {!isVendor && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50 font-semibold hidden sm:inline-flex items-center gap-1">
                                        <Award className="w-3 h-3" /> {vendorTrustScore}% Trust
                                    </span>
                                )}
                            </div>
                            <span className="text-[11px] text-stone-500 dark:text-stone-400">
                                {trip?.title} • {trip?.duration_days} Days • <span className="text-maroon-800 dark:text-amber-400 font-semibold">Tourist User ID: #{chat.tourist_id}</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {proposal && (
                        <div className="text-right hidden sm:block">
                            <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase block font-semibold">ACTIVE QUOTE</span>
                            <span className="text-sm font-extrabold text-maroon-800 dark:text-emerald-400 font-mono">
                                ₹{Number(proposal.quote_price).toLocaleString()}
                            </span>
                        </div>
                    )}

                    {isVendor && !isBooked && (
                        <button
                            type="button"
                            onClick={() => setRevisedModalOpen(true)}
                            className="px-3.5 py-1.5 bg-maroon-50 dark:bg-amber-950/40 hover:bg-maroon-100 dark:hover:bg-amber-900/50 text-maroon-800 dark:text-amber-300 text-xs font-bold rounded-xl border border-maroon-200 dark:border-amber-800/50 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-maroon-700 dark:text-amber-400" />
                            <span>Send Revised Quote</span>
                        </button>
                    )}

                    {isTourist && !isBooked && proposal && (
                        <button
                            type="button"
                            onClick={handleAcceptBaseProposal}
                            className="px-4 py-2 bg-maroon-800 hover:bg-maroon-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept Proposal</span>
                        </button>
                    )}

                    {isBooked && (
                        <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-300 text-xs font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Booked
                        </span>
                    )}
                </div>
            </header>

            {/* Main Chat Layout (Split) */}
            <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
                {/* LEFT 2 COLS: Live Chat Messages */}
                <div className="lg:col-span-2 flex flex-col h-[calc(100vh-65px)] border-r border-[#E6D5B8] dark:border-stone-800 bg-white dark:bg-stone-900">
                    {/* Message stream */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FFFDF7]/60 dark:bg-stone-950/40">
                        {/* Notice Banner */}
                        <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-800 text-center text-xs text-stone-600 dark:text-stone-400 max-w-lg mx-auto shadow-xs">
                            <Shield className="w-4 h-4 text-maroon-800 dark:text-amber-400 inline mr-1 mb-0.5" />
                            <strong>Encrypted Safe Negotiation:</strong> Discuss vehicle models, pickup timing, hotel room upgrades and discounts. When ready, accept the vendor quote directly below.
                        </div>

                        {/* Booking Confirmed Direct Contact Strip */}
                        {isBooked && (
                            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-stone-800 dark:text-stone-200 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-stone-900 dark:text-white text-xs flex items-center gap-1.5">
                                            <span>Booking Finalized & Confirmed</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 font-extrabold">₹{Number(proposal?.quote_price || trip?.budget_min || 0).toLocaleString()}</span>
                                        </div>
                                        <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                                            {isTourist 
                                                ? `Direct contact line with ${chat.vendor?.business_name}:`
                                                : `Direct contact line with Tourist (${chat.tourist?.name}):`
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {isTourist && chat.vendor?.phone && (
                                        <a
                                            href={`tel:${chat.vendor.phone}`}
                                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                            <span>Call Vendor</span>
                                        </a>
                                    )}
                                    {isTourist && (
                                        <a
                                            href={`https://wa.me/91${(chat.vendor?.phone || '9840123456').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${chat.vendor?.business_name}, I booked trip #${chat.custom_trip_id} on TN Explore. Let's coordinate pickup timing!`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3.5 py-1.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            <span>WhatsApp</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {chat.messages && chat.messages.map(msg => {
                            const isMe = msg.sender_id === currentUserId;
                            const isVendorMsg = msg.sender_role === 'vendor';
                            const payload = msg.custom_quote_payload;
                            const hasPayload = payload && payload.price;
                            const isQuoteOpen = payload?.status === 'open_for_acceptance' && !isBooked;
                            const isQuoteBooked = payload?.status === 'accepted_and_booked';

                            return (
                                <div 
                                    key={msg.id} 
                                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                >
                                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-stone-500 dark:text-stone-400 px-1">
                                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                                            {isMe ? 'You' : (msg.sender?.name || (isVendorMsg ? 'Vendor' : 'Tourist'))}
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                            (msg.sender_role === 'vendor' || isVendorMsg)
                                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50'
                                                : (msg.sender_role === 'admin' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50' : 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50')
                                        }`}>
                                            {msg.sender_role === 'vendor' || isVendorMsg ? '🏢 Vendor' : (msg.sender_role === 'admin' ? '🛡️ Admin' : '👤 Tourist')}
                                        </span>
                                        <span>•</span>
                                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>

                                    <div 
                                        className={`max-w-[90%] sm:max-w-[75%] rounded-3xl p-4 text-xs sm:text-sm shadow-xs ${
                                            isMe 
                                                ? 'bg-maroon-800 text-white rounded-tr-xs' 
                                                : 'bg-white dark:bg-stone-800 border border-[#E6D5B8] dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-tl-xs'
                                        }`}
                                    >
                                        {/* Revised Quote Special Card */}
                                        {hasPayload && (
                                            <div className="p-4 bg-[#FAF7F0] dark:bg-stone-900 rounded-2xl border border-[#E6D5B8] dark:border-stone-700 mb-3 text-left space-y-3 shadow-xs">
                                                <div className="flex items-center justify-between gap-2 border-b border-[#E6D5B8] dark:border-stone-700 pb-2.5">
                                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-maroon-800 dark:text-amber-400 flex items-center gap-1.5">
                                                        <Sparkles className="w-3.5 h-3.5 text-maroon-700 dark:text-amber-400" /> 
                                                        Official Revised Quotation
                                                    </span>
                                                    <span className="text-base sm:text-lg font-black text-maroon-800 dark:text-emerald-400 font-mono">
                                                        ₹{Number(payload.price).toLocaleString()}
                                                    </span>
                                                </div>

                                                {/* Meta: Vehicle & Hotel */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                    {payload.vehicle_model && (
                                                        <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-stone-800 border border-[#E6D5B8] dark:border-stone-700 text-stone-800 dark:text-stone-300">
                                                            <Car className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                                            <span className="truncate font-medium">{payload.vehicle_model}</span>
                                                        </div>
                                                    )}
                                                    {payload.hotel_category && (
                                                        <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-stone-800 border border-[#E6D5B8] dark:border-stone-700 text-stone-800 dark:text-stone-300">
                                                            <Hotel className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                                                            <span className="truncate font-medium">{payload.hotel_category}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Inclusions checklist */}
                                                {Array.isArray(payload.inclusions) && payload.inclusions.length > 0 && (
                                                    <div className="space-y-1.5 pt-1 text-[11px]">
                                                        <span className="text-stone-600 dark:text-stone-400 font-semibold block uppercase tracking-wider text-[10px]">
                                                            Guaranteed Inclusions:
                                                        </span>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-stone-700 dark:text-stone-300">
                                                            {payload.inclusions.map((inc, i) => (
                                                                <div key={i} className="flex items-start gap-1.5">
                                                                    <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                                                    <span>{inc}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Notes */}
                                                {payload.notes && (
                                                    <div className="p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-[#E6D5B8] dark:border-stone-700 text-[11px] text-stone-700 dark:text-stone-300">
                                                        <strong className="text-maroon-800 dark:text-amber-400 block mb-0.5 font-bold">Vendor Note:</strong>
                                                        {payload.notes}
                                                    </div>
                                                )}

                                                {/* Tourist Review & Acceptance Button */}
                                                {isTourist && isQuoteOpen && (
                                                    <div className="pt-2 border-t border-[#E6D5B8] dark:border-stone-700">
                                                        <button
                                                            type="button"
                                                            disabled={acceptingMsgId === msg.id}
                                                            onClick={() => handleOpenConfirmModal(msg.id, payload.price, payload)}
                                                            className="w-full py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Review Quote & Book (₹{Number(payload.price).toLocaleString()})
                                                        </button>
                                                    </div>
                                                )}

                                                {isQuoteBooked && (
                                                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5">
                                                        <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                        Deal Accepted & Booked
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <p className="whitespace-pre-wrap leading-relaxed">
                                            {msg.message}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white dark:bg-stone-900 border-t border-[#E6D5B8] dark:border-stone-800 flex items-center gap-2">
                        {isVendor && !isBooked && (
                            <button
                                type="button"
                                onClick={() => setRevisedModalOpen(true)}
                                className="p-2.5 bg-[#FAF7F0] dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-maroon-800 dark:text-amber-400 rounded-xl border border-[#E6D5B8] dark:border-stone-700 transition-colors cursor-pointer"
                                title="Send revised quotation offer"
                            >
                                <Sparkles className="w-4 h-4" />
                            </button>
                        )}
                        <input
                            type="text"
                            value={data.message}
                            onChange={e => setData('message', e.target.value)}
                            placeholder={isVendor ? 'Message tourist with clarifications or custom timing notes...' : 'Ask about cab pickups, room upgrades, or specific sightseeing spots...'}
                            className="flex-1 bg-[#FAF7F0] dark:bg-stone-950 border border-[#E6D5B8] dark:border-stone-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-maroon-800 dark:focus:border-amber-400"
                        />
                        <button
                            type="submit"
                            disabled={processing || !data.message.trim()}
                            className="p-2.5 sm:px-4 sm:py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-40 shadow-sm cursor-pointer"
                        >
                            <Send className="w-4 h-4" />
                            <span className="hidden sm:inline text-xs">Send</span>
                        </button>
                    </form>
                </div>

                {/* RIGHT COL: Proposal & Trip Overview Sidebar */}
                <div className="hidden lg:block p-6 bg-[#FAF7F0]/60 dark:bg-stone-900/40 overflow-y-auto space-y-6">
                    {/* Proposal Summary Card */}
                    {proposal && (
                        <div className="bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                                    Quotation Status
                                </span>
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                    proposal.status === 'accepted' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                                }`}>
                                    {proposal.status.toUpperCase()}
                                </span>
                            </div>

                            <div>
                                <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase block font-semibold">PACKAGE PRICE</span>
                                <span className="text-2xl font-black text-maroon-800 dark:text-emerald-400 font-mono">
                                    ₹{Number(proposal.quote_price).toLocaleString()}
                                </span>
                            </div>

                            {/* Inclusions */}
                            <div className="space-y-1.5 pt-3 border-t border-[#E6D5B8] dark:border-stone-800 text-xs">
                                <strong className="text-stone-800 dark:text-stone-200 block text-[11px] uppercase font-bold">Included Amenities:</strong>
                                {Array.isArray(proposal.inclusions) && proposal.inclusions.map((inc, i) => (
                                    <div key={i} className="flex items-start gap-1.5 text-stone-700 dark:text-stone-300">
                                        <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                        <span>{inc}</span>
                                    </div>
                                ))}
                            </div>

                            {isTourist && !isBooked && (
                                <button
                                    type="button"
                                    onClick={handleAcceptBaseProposal}
                                    className="w-full py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Accept & Confirm Booking
                                </button>
                            )}
                        </div>
                    )}

                    {/* Trip Requirements Card */}
                    <div className="bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-800 rounded-3xl p-5 text-xs space-y-3 shadow-sm">
                        <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm font-serif">Trip Itinerary Details</h4>
                        
                        <div className="text-stone-600 dark:text-stone-400 space-y-2">
                            <div>
                                <span className="text-[10px] text-stone-400 uppercase block font-semibold">DESTINATIONS</span>
                                <span className="text-stone-900 dark:text-stone-200 font-semibold">{Array.isArray(trip?.destinations) ? trip.destinations.join(' • ') : trip?.destinations}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-stone-400 uppercase block font-semibold">TRAVEL PERSONA</span>
                                <span className="text-stone-900 dark:text-stone-200 font-semibold capitalize">{trip?.trip_type?.replace('_', ' ')} ({trip?.adults_count} Adults)</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-stone-400 uppercase block font-semibold">STAY & CAB</span>
                                <span className="text-stone-800 dark:text-stone-200 capitalize">{trip?.accommodation_pref?.replace('_', ' ')} • {trip?.transport_pref?.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* VENDOR REVISED QUOTE MODAL */}
            {revisedModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-stone-900 dark:text-stone-100">
                        <div className="flex items-center justify-between border-b border-[#E6D5B8] dark:border-stone-800 pb-3">
                            <h3 className="font-bold text-stone-900 dark:text-white text-base flex items-center gap-2 font-serif">
                                <Sparkles className="w-5 h-5 text-maroon-800 dark:text-amber-400" />
                                Send Official Revised Quotation
                            </h3>
                            <button
                                onClick={() => setRevisedModalOpen(false)}
                                className="p-1 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSendRevisedOffer} className="space-y-4">
                            {/* Price */}
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                    Revised Final Price (₹) <span className="text-maroon-800 dark:text-amber-400">*</span>
                                </label>
                                <div className="relative">
                                    <IndianRupee className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                                    <input
                                        type="number"
                                        min="100"
                                        value={revisedPrice}
                                        onChange={e => setRevisedPrice(e.target.value)}
                                        className="w-full bg-[#FAF7F0] dark:bg-stone-950 border border-[#E6D5B8] dark:border-stone-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-stone-900 dark:text-white font-bold focus:outline-none focus:border-maroon-800 dark:focus:border-amber-400"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Vehicle & Stay */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                        Assigned Vehicle Model
                                    </label>
                                    <input
                                        type="text"
                                        value={revisedVehicle}
                                        onChange={e => setRevisedVehicle(e.target.value)}
                                        placeholder="e.g. Innova Crysta AC"
                                        className="w-full bg-[#FAF7F0] dark:bg-stone-950 border border-[#E6D5B8] dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-maroon-800 dark:focus:border-amber-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                        Hotel / Stay Tier
                                    </label>
                                    <input
                                        type="text"
                                        value={revisedHotel}
                                        onChange={e => setRevisedHotel(e.target.value)}
                                        placeholder="e.g. 3-Star Deluxe Heritage"
                                        className="w-full bg-[#FAF7F0] dark:bg-stone-950 border border-[#E6D5B8] dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-maroon-800 dark:focus:border-amber-400"
                                    />
                                </div>
                            </div>

                            {/* Inclusions Checklist */}
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                                    Select Guaranteed Inclusions ({selectedInclusions.length} selected)
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 bg-[#FAF7F0] dark:bg-stone-950 rounded-xl border border-[#E6D5B8] dark:border-stone-700">
                                    {COMMON_INCLUSIONS.map((item, idx) => {
                                        const isSelected = selectedInclusions.includes(item);
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => toggleInclusion(item)}
                                                className={`text-left text-[11px] p-2 rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
                                                    isSelected 
                                                        ? 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-maroon-900 dark:text-amber-300 font-semibold' 
                                                        : 'bg-white dark:bg-stone-900 border-[#E6D5B8] dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-400'
                                                }`}
                                            >
                                                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                                                    isSelected ? 'bg-maroon-800 border-maroon-800 text-white' : 'border-stone-300 dark:border-stone-600'
                                                }`}>
                                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                                <span className="truncate">{item}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Custom Inclusion Input */}
                                <div className="flex gap-2 mt-2">
                                    <input
                                        type="text"
                                        value={customInclusionInput}
                                        onChange={e => setCustomInclusionInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomInclusion(); } }}
                                        placeholder="Add custom amenity (e.g. Boating tickets)..."
                                        className="flex-1 bg-[#FAF7F0] dark:bg-stone-950 border border-[#E6D5B8] dark:border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:border-maroon-800 dark:focus:border-amber-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={addCustomInclusion}
                                        className="px-3.5 py-1.5 bg-[#FAF7F0] hover:bg-[#E6D5B8] dark:bg-stone-800 dark:hover:bg-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-200 rounded-lg border border-[#E6D5B8] dark:border-stone-700 cursor-pointer"
                                    >
                                        + Add
                                    </button>
                                </div>
                            </div>

                            {/* Notes / Special Highlights */}
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                    Special Notes / Custom Upgrades Included
                                </label>
                                <textarea
                                    rows="2"
                                    value={revisedNote}
                                    onChange={e => setRevisedNote(e.target.value)}
                                    placeholder="e.g. Discounted rate for early booking + complimentary sunrise boat ride in Kanyakumari."
                                    className="w-full bg-[#FAF7F0] dark:bg-stone-950 border border-[#E6D5B8] dark:border-stone-700 rounded-xl px-3.5 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-maroon-800 dark:focus:border-amber-400"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-[#E6D5B8] dark:border-stone-800">
                                <button
                                    type="button"
                                    onClick={() => setRevisedModalOpen(false)}
                                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingQuote}
                                    className="px-5 py-2 bg-maroon-800 hover:bg-maroon-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {isSubmittingQuote ? 'Submitting...' : 'Send Revised Offer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* TOURIST QUOTE TERMS & BOOKING CONFIRMATION MODAL */}
            {selectedQuoteToConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 text-stone-900 dark:text-white space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#E6D5B8] dark:border-stone-800 pb-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                <h3 className="font-bold text-base font-serif text-stone-900 dark:text-white">Confirm Custom Trip Booking</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedQuoteToConfirm(null)}
                                className="text-stone-400 hover:text-stone-900 dark:hover:text-white cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Quote Summary Box */}
                        <div className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-950 border border-[#E6D5B8] dark:border-stone-700 space-y-2.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-stone-600 dark:text-stone-400">Tour Operator:</span>
                                <strong className="text-stone-900 dark:text-white text-sm">{chat.vendor?.business_name || 'Verified Vendor'}</strong>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-stone-600 dark:text-stone-400">Itinerary / Package:</span>
                                <span className="text-maroon-800 dark:text-amber-400 font-semibold">{trip?.title}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-[#E6D5B8] dark:border-stone-700">
                                <span className="text-stone-700 dark:text-stone-400 font-bold">Total Agreed Quote:</span>
                                <span className="text-xl font-black text-maroon-800 dark:text-emerald-400 font-mono">
                                    ₹{Number(selectedQuoteToConfirm.price).toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>

                        {/* Terms of Service Box */}
                        <div className="p-3.5 rounded-2xl bg-[#FAF7F0]/60 dark:bg-stone-950/60 border border-[#E6D5B8] dark:border-stone-800 space-y-2 text-[11px] text-stone-700 dark:text-stone-300">
                            <strong className="text-amber-800 dark:text-amber-300 block font-semibold">Travel Terms & Inclusions Policy:</strong>
                            <ul className="space-y-1 text-stone-600 dark:text-stone-400 list-disc list-inside">
                                <li>Direct local fulfillment by certified tour operator ({chat.vendor?.business_name}).</li>
                                <li>Free cancellation & rescheduling permitted up to 24 hours before trip departure.</li>
                                <li>Chauffeur fuel, highway tolls, and driver allowances are included in the quote.</li>
                                <li>Exact operator address will be confirmed upon deal finalization.</li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedQuoteToConfirm(null)}
                                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold cursor-pointer border border-[#E6D5B8] dark:border-stone-700"
                            >
                                Go Back
                            </button>
                            <button
                                type="button"
                                disabled={acceptingMsgId !== null}
                                onClick={handleConfirmQuoteBooking}
                                className="flex-2 py-2.5 rounded-xl bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{acceptingMsgId ? 'Confirming...' : 'I Agree & Confirm Booking'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

