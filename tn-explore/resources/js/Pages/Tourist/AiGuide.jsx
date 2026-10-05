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
            content: `✨ **Welcome! I am TN Mitra**, your official AI Smart Tourism Guide for Tamil Nadu.\n\nI am equipped with real-time verified data across all **38 districts**. I can plan personalized itineraries, unearth secret hidden gems, map out culinary food trails, and estimate trip budgets.\n\n*How can I assist your adventure today?*`,
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
            const reply = data.reply || 'Welcome! Unable to retrieve details. Please try again.';
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
                    content: '✨ **Welcome!** Chat history cleared. What corner of Tamil Nadu shall we explore next?',
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
            <div className="relative border-b border-[#E6D5B8] dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-maroon-50 dark:bg-amber-950/40 border border-maroon-200 dark:border-amber-800/50 text-maroon-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin" />
                            <span>AI TRAVEL COMPANION • RAG GROUNDED</span>
                        </div>

                        <h1 className="font-serif font-black text-3xl sm:text-5xl text-stone-900 dark:text-stone-100 tracking-tight">
                            TN Mitra <span className="text-maroon-800 dark:text-amber-500">AI Guide</span>
                        </h1>

                        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-2xl leading-relaxed">
                            Specialized Tamil Nadu tourism intelligence powered by cloud Gemini & local Ollama Mistral, verified across all 38 districts with voice and multilingual capabilities.
                        </p>
                    </div>

                    {/* Status & Action Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Live AI Status Badge */}
                        <div className="px-4 py-2 rounded-2xl bg-[#FAF7F0] dark:bg-stone-800 border border-[#E6D5B8] dark:border-stone-700 flex items-center gap-2.5 text-xs shadow-xs">
                            <span className={`w-3 h-3 rounded-full ${
                                aiSource === 'cloud' ? 'bg-emerald-500 shadow-xs' : aiSource === 'local' ? 'bg-amber-500 shadow-xs' : 'bg-red-500 shadow-xs'
                            }`} />
                            <div>
                                <span className="font-bold text-stone-900 dark:text-white block leading-none">
                                    {aiSource === 'cloud' ? 'Cloud Gemini' : aiSource === 'local' ? 'Local Ollama' : 'Offline Knowledge Engine'}
                                </span>
                                <span className="text-[10px] text-stone-500 dark:text-stone-400">
                                    {aiSource === 'cloud' ? 'Primary AI' : aiSource === 'local' ? 'Fallback Active' : 'Cached Records'}
                                </span>
                            </div>
                        </div>

                        {/* Print / Export */}
                        <button
                            type="button"
                            onClick={handlePrintItinerary}
                            className="px-4 py-2.5 rounded-2xl bg-[#FAF7F0] hover:bg-[#E6D5B8]/60 dark:bg-stone-800 dark:hover:bg-stone-700 border border-[#E6D5B8] dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                            title="Print or Save Itinerary as PDF"
                        >
                            <Printer className="w-4 h-4 text-maroon-700 dark:text-amber-400" />
                            <span>Export PDF / Print</span>
                        </button>

                        {/* Reset History */}
                        <button
                            type="button"
                            onClick={handleClearChat}
                            className="p-2.5 rounded-2xl bg-[#FAF7F0] hover:bg-red-50 dark:bg-stone-800 dark:hover:bg-red-950/40 border border-[#E6D5B8] dark:border-stone-700 text-stone-600 hover:text-red-700 dark:text-stone-400 dark:hover:text-red-300 text-xs transition-colors cursor-pointer shadow-xs"
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
                        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-800 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    <span>Focus District</span>
                                </h3>
                                {selectedDistrict && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedDistrict('')}
                                        className="text-[11px] text-maroon-800 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="w-full bg-[#FAF7F0] dark:bg-stone-950 border border-[#E6D5B8] dark:border-stone-700 rounded-2xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-maroon-800 dark:focus:border-amber-400 cursor-pointer"
                            >
                                <option value="">🌟 All 38 Tamil Nadu Districts</option>
                                {districts.map((d) => (
                                    <option key={d.id} value={d.name}>
                                        {d.name} ({d.region} TN)
                                    </option>
                                ))}
                            </select>

                            {selectedDistrict && (
                                <p className="text-[11px] text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 p-3 rounded-2xl leading-relaxed">
                                    💡 <strong>Active Scope:</strong> TN Mitra will prioritize verified attractions, heritage sites, and local delicacies from <strong>{selectedDistrict}</strong>.
                                </p>
                            )}
                        </div>

                        {/* Voice & Language Settings */}
                        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-800 shadow-sm space-y-4">
                            <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                <span>Voice & Language Engine</span>
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1.5">
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
                                                        ? 'bg-maroon-800 text-white shadow-xs'
                                                        : 'bg-[#FAF7F0] dark:bg-stone-800 border border-[#E6D5B8] dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200/50'
                                                }`}
                                            >
                                                {lang.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-[#E6D5B8] dark:border-stone-800">
                                    <span className="text-xs text-stone-700 dark:text-stone-300 flex items-center gap-1.5 font-medium">
                                        <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                        <span>Read Responses Aloud</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
                                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                                            voiceOutputEnabled ? 'bg-teal-600' : 'bg-stone-300 dark:bg-stone-700'
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
                        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-800 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                    <Car className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    <span>Compare Travel Options</span>
                                </h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                    Multi-Modal
                                </span>
                            </div>

                            <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                                Compare Train 🚆, Bus 🚌, Outstation Cab 🚗, and Motorbike 🛵 for any route (fares, duration, ghat road ratings).
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <label className="text-[10px] text-stone-500 dark:text-stone-400 block mb-1 font-semibold">From District:</label>
                                    <select
                                        value={compareFrom}
                                        onChange={(e) => setCompareFrom(e.target.value)}
                                        className="w-full bg-[#FAF7F0] dark:bg-stone-950 border border-[#E6D5B8] dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-900 dark:text-white"
                                    >
                                        {districts.map((d) => (
                                            <option key={`from-${d.id}`} value={d.name}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-stone-500 dark:text-stone-400 block mb-1 font-semibold">To District:</label>
                                    <select
                                        value={compareTo}
                                        onChange={(e) => setCompareTo(e.target.value)}
                                        className="w-full bg-[#FAF7F0] dark:bg-stone-950 border border-[#E6D5B8] dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-stone-900 dark:text-white"
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
                                className="w-full py-2.5 rounded-xl bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs shadow-sm hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Ask TN Mitra to Compare Modes</span>
                            </button>
                        </div>

                        {/* Quick Prompt Ideas */}
                        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-800 shadow-sm space-y-3">
                            <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                <span>Suggested Inquiries</span>
                            </h3>

                            <div className="space-y-2">
                                {samplePrompts.map((item, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSend(item.prompt)}
                                        className="w-full text-left p-3 rounded-2xl bg-[#FAF7F0] hover:bg-amber-50 dark:bg-stone-800 dark:hover:bg-stone-700 border border-[#E6D5B8] dark:border-stone-700 hover:border-amber-300 text-xs text-stone-800 dark:text-stone-200 hover:text-maroon-800 dark:hover:text-amber-400 transition-all flex items-center justify-between group cursor-pointer"
                                    >
                                        <span className="font-medium">{item.label}</span>
                                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-maroon-800 dark:text-amber-400" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Dynamic Chat Conversation Feed */}
                    <div className="lg:col-span-8 flex flex-col h-[740px] rounded-3xl bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-800 shadow-sm overflow-hidden">
                        {/* Feed Header */}
                        <div className="px-6 py-4 bg-[#FAF7F0] dark:bg-stone-800 border-b border-[#E6D5B8] dark:border-stone-700 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-maroon-800 text-white flex items-center justify-center shadow-xs">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                                        Conversation with TN Mitra
                                    </h2>
                                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                        Multi-Turn Memory Active • Verified Tamil Nadu Knowledge Base
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                                <Link
                                    href="/trip-builder"
                                    className="px-3.5 py-1.5 rounded-xl bg-maroon-50 dark:bg-amber-950/40 border border-maroon-200 dark:border-amber-800/50 text-maroon-800 dark:text-amber-400 hover:bg-maroon-100 dark:hover:bg-amber-900/50 transition-all font-bold flex items-center gap-1.5"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                    <span>Smart Trip Builder</span>
                                </Link>
                            </div>
                        </div>

                        {/* Messages Timeline */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FFFDF7]/60 dark:bg-stone-950/40">
                            {messages.map((msg, idx) => {
                                const isBot = msg.role === 'assistant';
                                return (
                                    <div
                                        key={msg.id || idx}
                                        className={`flex gap-4 ${isBot ? 'items-start' : 'items-end justify-end'}`}
                                    >
                                        {isBot && (
                                            <div className="w-9 h-9 rounded-2xl bg-maroon-800 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
                                                <Bot className="w-5 h-5" />
                                            </div>
                                        )}

                                        <div
                                            className={`group relative max-w-[85%] rounded-3xl p-5 shadow-xs ${
                                                isBot
                                                    ? 'bg-[#FAF7F0] dark:bg-stone-800 border border-[#E6D5B8] dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-tl-xs'
                                                    : 'bg-maroon-800 text-white rounded-br-xs'
                                            }`}
                                        >
                                            {/* Text Content */}
                                            <div className="prose prose-stone dark:prose-invert prose-sm max-w-none whitespace-pre-line text-sm leading-relaxed">
                                                {msg.content}
                                            </div>

                                            {/* RAG Metadata Cards */}
                                            {isBot && msg.rag_sources && msg.rag_sources.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-[#E6D5B8] dark:border-stone-700 space-y-2">
                                                    <span className="text-xs font-bold text-maroon-800 dark:text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                                                        <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                                        <span>Verified Travel Records Retrieved:</span>
                                                    </span>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {msg.rag_sources.slice(0, 4).map((r, i) => (
                                                            <div
                                                                key={i}
                                                                className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-700 flex items-start justify-between gap-2 text-xs hover:border-amber-400 transition-all"
                                                            >
                                                                <div>
                                                                    <h4 className="font-bold text-stone-900 dark:text-white text-xs">
                                                                        {r.name}
                                                                    </h4>
                                                                    <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                                                                        <MapPin className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                                                        <span>{r.district} • {r.type || r.category || 'Spot'}</span>
                                                                    </p>
                                                                </div>
                                                                {r.maps_url && (
                                                                    <a
                                                                        href={r.maps_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-maroon-800 dark:text-amber-400 hover:text-maroon-900 p-1"
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
                                            <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-1">
                                                <span>{msg.timestamp}</span>
                                                {isBot && (
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopy(msg.content, idx)}
                                                            className="flex items-center gap-1 hover:text-maroon-800 dark:hover:text-amber-400 cursor-pointer font-medium"
                                                        >
                                                            {copiedIndex === idx ? (
                                                                <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
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
                                            <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 flex items-center justify-center text-amber-800 dark:text-amber-300 flex-shrink-0 shadow-xs mb-0.5">
                                                <User className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Loading State */}
                            {isLoading && (
                                <div className="flex gap-4 items-start">
                                    <div className="w-9 h-9 rounded-2xl bg-maroon-800 text-white flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-5 h-5 animate-spin" />
                                    </div>
                                    <div className="p-4 rounded-3xl rounded-tl-xs bg-[#FAF7F0] dark:bg-stone-800 border border-[#E6D5B8] dark:border-stone-700 text-stone-700 dark:text-stone-300 text-sm flex items-center gap-3">
                                        <span className="flex gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-maroon-800 animate-bounce" />
                                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                                        </span>
                                        <span>TN Mitra is synthesizing verified tourism data & routes...</span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-stone-900 border-t border-[#E6D5B8] dark:border-stone-800">
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
                                            ? 'bg-red-100 dark:bg-red-950/50 border-red-400 text-red-600 animate-pulse'
                                            : 'bg-[#FAF7F0] dark:bg-stone-800 border-[#E6D5B8] dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-maroon-800 hover:border-maroon-400'
                                    }`}
                                    title={isListening ? 'Listening... click to stop' : 'Speak to TN Mitra'}
                                >
                                    {isListening ? <Mic className="w-5 h-5 text-red-600 animate-spin" /> : <Mic className="w-5 h-5" />}
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
                                    className="flex-1 bg-[#FAF7F0] dark:bg-stone-950 border border-[#E6D5B8] dark:border-stone-700 rounded-2xl px-4 py-3 text-sm text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-maroon-800 dark:focus:border-amber-400"
                                />

                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="px-6 py-3 rounded-2xl bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:scale-102 active:scale-98 transition-all shadow-sm cursor-pointer flex items-center gap-2 flex-shrink-0"
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
