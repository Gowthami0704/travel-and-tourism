import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';
import AdventureBackground from '@/Components/Themes/AdventureBackground';
import {
    Sparkles,
    Send,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    RotateCcw,
    MapPin,
    ExternalLink,
    Copy,
    Check,
    Bot,
    User,
    ArrowRight,
    Compass,
    Globe,
    Printer,
    Download,
    Calendar,
    Layers,
    Utensils,
    ShieldCheck,
    Search,
    ChevronRight,
    Coffee,
    Car,
    Train,
    Bus
} from 'lucide-react';

export default function AiGuide({ districts = [], initialContext = {} }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiSource, setAiSource] = useState('cloud'); // 'cloud' | 'local' | 'offline'
    const [selectedDistrict, setSelectedDistrict] = useState(initialContext.district || '');
    const [compareFrom, setCompareFrom] = useState('Chennai');
    const [compareTo, setCompareTo] = useState('Madurai');
    const [voiceLang, setVoiceLang] = useState('ta-IN');
    const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Initial load from storage or default
    useEffect(() => {
        try {
            const saved = localStorage.getItem('tn_mitra_chat_history');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                    return;
                }
            }
        } catch (e) {}

        const defaultWelcome = {
            id: 'init-1',
            role: 'assistant',
            content: `🙏 **Vanakkam! I am TN Mitra**, your official AI Smart Tourism Guide for Tamil Nadu.\n\nI am equipped with real-time verified data across all **38 districts**. I can plan personalized itineraries, unearth secret hidden gems, map out culinary food trails, and estimate trip budgets.\n\n*How can I assist your adventure today?*`,
            source: 'cloud',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages([defaultWelcome]);
    }, []);

    // Save history
    useEffect(() => {
        if (messages.length > 0) {
            try {
                localStorage.setItem('tn_mitra_chat_history', JSON.stringify(messages.slice(-20)));
            } catch (e) {}
        }
    }, [messages]);

    // Scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Web Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = voiceLang;

            recognition.onstart = () => setIsListening(true);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                setIsListening(false);
            };
            recognition.onerror = () => setIsListening(false);
            recognition.onend = () => setIsListening(false);

            recognitionRef.current = recognition;
        }
    }, [voiceLang]);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Voice input is not supported in this browser. Please try Chrome or Edge.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.lang = voiceLang;
                recognitionRef.current.start();
            } catch (e) {
                console.error(e);
            }
        }
    };

    const speakText = (text) => {
        if (!voiceOutputEnabled || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/[*#_`>]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = voiceLang;
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    const handleSend = async (queryText = null) => {
        const text = (queryText || inputValue).trim();
        if (!text || isLoading) return;

        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputValue('');
        setIsLoading(true);

        try {
            const historyPayload = newMessages.slice(-10).map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                    history: historyPayload,
                    context: {
                        district: selectedDistrict,
                    },
                }),
            });

            const data = await res.json();
            const reply = data.reply || 'Vanakkam! Unable to retrieve details. Please try again.';
            const source = data.source || 'offline';
            setAiSource(source);

            const botMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: reply,
                source: source,
                rag_sources: data.rag_sources || [],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages((prev) => [...prev, botMsg]);
            speakText(reply);
        } catch (e) {
            console.error('AI chat failed:', e);
            setAiSource('offline');
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: '⚠️ **AI is currently offline.** Please check your internet connection or start the local Ollama service (`ollama run mistral`).',
                    source: 'offline',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        if (confirm('Clear all conversation history?')) {
            localStorage.removeItem('tn_mitra_chat_history');
            setMessages([
                {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: '🙏 **Vanakkam!** Chat history cleared. What corner of Tamil Nadu shall we explore next?',
                    source: 'cloud',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
            ]);
        }
    };

    const handleCopy = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handlePrintItinerary = () => {
        window.print();
    };

    const samplePrompts = [
        { label: '🚗 Compare Bus vs Train vs Cab to Madurai', prompt: 'Compare Bus vs Train vs Outstation Cab travel from Chennai to Madurai: ticket costs, travel hours, comfort and scenic tips.' },
        { label: '🏔️ Compare Travel Options to Ooty', prompt: 'Compare travel options to Ooty (Nilgiris) by Toy Train, Bus, and Self-Drive Car: hairpins, viewpoints, and best choice.' },
        { label: '🗓️ 3-Day Kodaikanal Itinerary', prompt: 'Plan a 3-day budget trip to Kodaikanal with places, timings, and authentic local food.' },
        { label: '🦞 Nagapattinam Seafood Trail', prompt: 'What are the best seafood specialties and famous coastal spots in Nagapattinam district?' },
        { label: '⚖️ Compare Ooty vs Kodaikanal', prompt: 'Compare Ooty vs Kodaikanal for a 4-day vacation: weather, scenery, budget, and activities.' },
        { label: '💎 Ariyalur Hidden Gems', prompt: 'Tell me about secret offbeat destinations and fossil heritage in Ariyalur district.' },
        { label: '☕ Madurai 1-Day Food Tour', prompt: 'Give me a 1-day culinary food walk in Madurai from morning Idli to night Jigarthanda.' },
        { label: '🏖️ Rameshwaram & Dhanushkodi', prompt: 'Plan a 2-day spiritual and coastal journey across Rameshwaram and Ghost Town Dhanushkodi.' }
    ];

    return (
        <MainLayout>
            <Head title="TN Mitra AI — Your Smart Tamil Nadu Travel Companion" />

            {/* Page Header */}
            <div className="relative border-b border-white/10 bg-[#070B14] overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
                <AdventureBackground />

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-gold animate-spin" />
                            <span>AI TRAVEL COMPANION • RAG GROUNDED</span>
                        </div>

                        <h1 className="font-display font-black text-3xl sm:text-5xl text-white">
                            TN Mitra <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-gold to-amber-400">AI Guide</span>
                        </h1>

                        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
                            Specialized Tamil Nadu tourism intelligence powered by cloud Gemini & local Ollama Mistral, verified across all 38 districts with voice and multilingual capabilities.
                        </p>
                    </div>

                    {/* Status & Action Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Live AI Status Badge */}
                        <div className="px-4 py-2 rounded-2xl bg-navy-card/90 border border-white/10 flex items-center gap-2.5 text-xs shadow-lg">
                            <span className={`w-3 h-3 rounded-full ${
                                aiSource === 'cloud' ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50' : aiSource === 'local' ? 'bg-amber-400 shadow-lg shadow-amber-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'
                            }`} />
                            <div>
                                <span className="font-bold text-white block leading-none">
                                    {aiSource === 'cloud' ? 'Cloud Gemini' : aiSource === 'local' ? 'Local Ollama' : 'Offline Knowledge Engine'}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    {aiSource === 'cloud' ? 'Primary AI' : aiSource === 'local' ? 'Fallback Active' : 'Cached Records'}
                                </span>
                            </div>
                        </div>

                        {/* Print / Export */}
                        <button
                            type="button"
                            onClick={handlePrintItinerary}
                            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Print or Save Itinerary as PDF"
                        >
                            <Printer className="w-4 h-4 text-gold" />
                            <span>Export PDF / Print</span>
                        </button>

                        {/* Reset History */}
                        <button
                            type="button"
                            onClick={handleClearChat}
                            className="p-2.5 rounded-2xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-gray-400 hover:text-red-400 text-xs transition-colors cursor-pointer"
                            title="Clear History"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT SIDEBAR: Controls, District Context, Sample Inquiries */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* District Context Focus Box */}
                        <div className="p-5 rounded-3xl bg-navy-card/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gold" />
                                    <span>Focus District</span>
                                </h3>
                                {selectedDistrict && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedDistrict('')}
                                        className="text-[11px] text-gold hover:underline cursor-pointer"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="w-full bg-[#0E1528] border border-white/15 focus:border-gold rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold cursor-pointer"
                            >
                                <option value="">🌟 All 38 Tamil Nadu Districts</option>
                                {districts.map((d) => (
                                    <option key={d.id} value={d.name}>
                                        📍 {d.name} ({d.region} TN)
                                    </option>
                                ))}
                            </select>

                            {selectedDistrict && (
                                <p className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl leading-relaxed">
                                    💡 <strong>Active Scope:</strong> TN Mitra will prioritize verified attractions, heritage sites, and local delicacies from <strong>{selectedDistrict}</strong>.
                                </p>
                            )}
                        </div>

                        {/* Voice & Language Settings */}
                        <div className="p-5 rounded-3xl bg-navy-card/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
                            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                                <Globe className="w-4 h-4 text-gold" />
                                <span>Voice & Language Engine</span>
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[11px] font-semibold text-gray-400 block mb-1.5">
                                        Voice Recognition & Speech Language:
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'ta-IN', label: 'தமிழ்' },
                                            { id: 'en-IN', label: 'English' },
                                            { id: 'hi-IN', label: 'हिंदी' },
                                        ].map((lang) => (
                                            <button
                                                key={lang.id}
                                                type="button"
                                                onClick={() => setVoiceLang(lang.id)}
                                                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                    voiceLang === lang.id
                                                        ? 'bg-gradient-to-r from-gold to-amber-500 text-slate-950 shadow-md shadow-gold/20'
                                                        : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white'
                                                }`}
                                            >
                                                {lang.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                    <span className="text-xs text-gray-300 flex items-center gap-1.5">
                                        <Volume2 className="w-3.5 h-3.5 text-gold" />
                                        <span>Read Responses Aloud</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
                                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                            voiceOutputEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                                        }`}
                                    >
                                        <div
                                            className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                                                voiceOutputEnabled ? 'left-6' : 'left-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Compare Travel Options Quick Tool */}
                        <div className="p-5 rounded-3xl bg-navy-card/90 border border-gold/30 backdrop-blur-xl shadow-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                                    <Car className="w-4 h-4 text-gold" />
                                    <span>Compare Travel Options</span>
                                </h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">
                                    Multi-Modal
                                </span>
                            </div>

                            <p className="text-[11px] text-gray-400">
                                Compare Train 🚆, Bus 🚌, Outstation Cab 🚗, and Motorbike 🛵 for any route (fares, duration, ghat road ratings).
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <label className="text-[10px] text-gray-400 block mb-1">From District:</label>
                                    <select
                                        value={compareFrom}
                                        onChange={(e) => setCompareFrom(e.target.value)}
                                        className="w-full bg-[#0E1528] border border-white/15 focus:border-gold rounded-xl px-2.5 py-1.5 text-xs text-white"
                                    >
                                        {districts.map((d) => (
                                            <option key={`from-${d.id}`} value={d.name}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 block mb-1">To District:</label>
                                    <select
                                        value={compareTo}
                                        onChange={(e) => setCompareTo(e.target.value)}
                                        className="w-full bg-[#0E1528] border border-white/15 focus:border-gold rounded-xl px-2.5 py-1.5 text-xs text-white"
                                    >
                                        {districts.map((d) => (
                                            <option key={`to-${d.id}`} value={d.name}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleSend(`Compare travel options from ${compareFrom} to ${compareTo} by Train, Bus, Outstation Cab, and Motorbike: approximate costs, travel duration, comfort rating, and recommendation.`)}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 font-bold text-xs shadow-md shadow-gold/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Ask TN Mitra to Compare Modes</span>
                            </button>
                        </div>

                        {/* Quick Prompt Ideas */}
                        <div className="p-5 rounded-3xl bg-navy-card/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-3">
                            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-gold" />
                                <span>Suggested Inquiries</span>
                            </h3>

                            <div className="space-y-2">
                                {samplePrompts.map((item, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSend(item.prompt)}
                                        className="w-full text-left p-3 rounded-2xl bg-white/5 hover:bg-gold/15 border border-white/10 hover:border-gold/30 text-xs text-gray-200 hover:text-gold transition-all flex items-center justify-between group cursor-pointer"
                                    >
                                        <span className="font-medium">{item.label}</span>
                                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Dynamic Chat Conversation Feed */}
                    <div className="lg:col-span-8 flex flex-col h-[740px] rounded-3xl bg-navy-card/90 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
                        {/* Feed Header */}
                        <div className="px-6 py-4 bg-gradient-to-r from-[#0C1222] via-[#10182E] to-[#0C1222] border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-gold to-emerald-500 p-0.5 shadow-md shadow-gold/20">
                                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-gold" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="font-display font-bold text-base text-white">
                                        Conversation with TN Mitra
                                    </h2>
                                    <p className="text-[11px] text-gray-400">
                                        Multi-Turn Memory Active • Verified Tamil Nadu Knowledge Base
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                                <Link
                                    href="/trip-builder"
                                    className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition-all font-semibold flex items-center gap-1.5"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-gold" />
                                    <span>Toy Trip Builder</span>
                                </Link>
                            </div>
                        </div>

                        {/* Messages Timeline */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                            {messages.map((msg, idx) => {
                                const isBot = msg.role === 'assistant';
                                return (
                                    <div
                                        key={msg.id || idx}
                                        className={`flex gap-4 ${isBot ? 'items-start' : 'items-end justify-end'}`}
                                    >
                                        {isBot && (
                                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-gold to-amber-600 flex items-center justify-center text-slate-950 font-bold flex-shrink-0 shadow-lg shadow-gold/20">
                                                <Bot className="w-5 h-5" />
                                            </div>
                                        )}

                                        <div
                                            className={`group relative max-w-[85%] rounded-3xl p-5 shadow-xl ${
                                                isBot
                                                    ? 'bg-[#0E1528] border border-white/10 text-slate-100 rounded-tl-sm'
                                                    : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-br-sm'
                                            }`}
                                        >
                                            {/* Text Content */}
                                            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-line text-sm leading-relaxed">
                                                {msg.content}
                                            </div>

                                            {/* RAG Metadata Cards */}
                                            {isBot && msg.rag_sources && msg.rag_sources.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                                                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block flex items-center gap-1.5">
                                                        <Sparkles className="w-3 h-3 text-gold" />
                                                        <span>Verified Travel Records Retrieved:</span>
                                                    </span>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {msg.rag_sources.slice(0, 4).map((r, i) => (
                                                            <div
                                                                key={i}
                                                                className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-start justify-between gap-2 text-xs hover:border-gold/30 transition-all"
                                                            >
                                                                <div>
                                                                    <h4 className="font-bold text-white text-xs">
                                                                        {r.name}
                                                                    </h4>
                                                                    <p className="text-[11px] text-gray-400">
                                                                        📍 {r.district} • {r.type || r.category || 'Spot'}
                                                                    </p>
                                                                </div>
                                                                {r.maps_url && (
                                                                    <a
                                                                        href={r.maps_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-gold hover:text-gold-light p-1"
                                                                        title="View on Google Maps"
                                                                    >
                                                                        <MapPin className="w-3.5 h-3.5" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Footer Actions */}
                                            <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 pt-1">
                                                <span>{msg.timestamp}</span>
                                                {isBot && (
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(msg.content, idx)}
                                                            className="flex items-center gap-1 hover:text-gold cursor-pointer"
                                                        >
                                                            {copiedIndex === idx ? (
                                                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                            ) : (
                                                                <Copy className="w-3.5 h-3.5" />
                                                            )}
                                                            <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {!isBot && (
                                            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 flex-shrink-0 shadow-lg mb-0.5">
                                                <User className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Loading State */}
                            {isLoading && (
                                <div className="flex gap-4 items-start">
                                    <div className="w-9 h-9 rounded-2xl bg-gold flex items-center justify-center text-slate-950 flex-shrink-0">
                                        <Sparkles className="w-5 h-5 animate-spin" />
                                    </div>
                                    <div className="p-4 rounded-3xl rounded-tl-sm bg-[#0E1528] border border-white/10 text-gray-300 text-sm flex items-center gap-3">
                                        <span className="flex gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-gold animate-bounce" />
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                        </span>
                                        <span>TN Mitra is synthesizing verified tourism data & routes...</span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-[#080D1A] border-t border-white/10">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="flex items-center gap-3"
                            >
                                <button
                                    type="button"
                                    onClick={toggleListening}
                                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex-shrink-0 ${
                                        isListening
                                            ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-gold hover:border-gold/40'
                                    }`}
                                    title={isListening ? 'Listening... click to stop' : 'Speak to TN Mitra'}
                                >
                                    {isListening ? <Mic className="w-5 h-5 text-red-400 animate-spin" /> : <Mic className="w-5 h-5" />}
                                </button>

                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={
                                        isListening
                                            ? 'Listening to your voice...'
                                            : selectedDistrict
                                                ? `Ask TN Mitra about ${selectedDistrict} (places, food, itinerary, secret gems)...`
                                                : 'Ask about any of the 38 districts, heritage, food trails, or budget plans...'
                                    }
                                    className="flex-1 bg-slate-900/90 border border-white/15 focus:border-gold rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold"
                                />

                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gold/25 cursor-pointer flex items-center gap-2 flex-shrink-0"
                                >
                                    <span>Send</span>
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
