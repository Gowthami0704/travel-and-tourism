import React, { useState, useEffect, useRef } from 'react';
import { usePage, Link } from '@inertiajs/react';
import {
    Sparkles,
    MessageSquare,
    X,
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
    Download
} from 'lucide-react';

export default function TnMitraChatBubble() {
    const { url, props } = usePage();
    const districtProp = props?.district;

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiSource, setAiSource] = useState('cloud'); // 'cloud' | 'local' | 'offline'
    const [isListening, setIsListening] = useState(false);
    const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
    const [voiceLang, setVoiceLang] = useState('ta-IN'); // 'ta-IN' | 'en-IN' | 'hi-IN'
    const [copiedIndex, setCopiedIndex] = useState(null);

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Contextual district detection
    const currentDistrictName = districtProp?.name || null;

    // Load initial history from localStorage
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
        } catch (e) {
            console.error('Failed to load TN Mitra history:', e);
        }

        // Default initial welcome message
        const welcomeDistrictText = currentDistrictName
            ? `Ask me about top places, secret gems, or authentic food in **${currentDistrictName}**!`
            : "I can help you explore all 38 districts, discover secret waterfalls, plan budget itineraries, and find authentic Tamil food.";

        setMessages([
            {
                id: 'welcome-1',
                role: 'assistant',
                content: `🙏 **Vanakkam! I am TN Mitra**, your AI Smart Travel Companion for Tamil Nadu.\n\n${welcomeDistrictText}`,
                source: 'cloud',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
        ]);
    }, []);

    // Save history to localStorage
    useEffect(() => {
        if (messages.length > 0) {
            try {
                localStorage.setItem('tn_mitra_chat_history', JSON.stringify(messages.slice(-15)));
            } catch (e) {
                // ignore quota errors
            }
        }
    }, [messages]);

    // Scroll to bottom on new message
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // Setup Web Speech Recognition
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
            alert('Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
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

    // Text to Speech
    const speakText = (text) => {
        if (!voiceOutputEnabled || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        // Strip markdown
        const cleanText = text.replace(/[*#_`>]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = voiceLang;
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    const handleSendMessage = async (textToSend = null) => {
        const query = (textToSend || inputValue).trim();
        if (!query || isLoading) return;

        const userMsg = {
            id: Date.now().toString(),
            role: 'user',
            content: query,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputValue('');
        setIsLoading(true);

        try {
            // Prepare history payload (last 8 messages)
            const historyPayload = newMessages.slice(-8).map((m) => ({
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
                    message: query,
                    history: historyPayload,
                    context: {
                        district: currentDistrictName,
                        currentUrl: url,
                    },
                }),
            });

            const data = await res.json();
            const replyContent = data.reply || 'Vanakkam! I am having trouble fetching suggestions. Please try again.';
            const source = data.source || 'offline';
            setAiSource(source);

            const botMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: replyContent,
                source: source,
                rag_sources: data.rag_sources || [],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages((prev) => [...prev, botMsg]);
            speakText(replyContent);
        } catch (error) {
            console.error('Chat error:', error);
            setAiSource('offline');
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: '⚠️ **AI is currently offline.** Please check your internet connection or start the local Ollama service (`ollama run mistral`).',
                    source: 'offline',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const resetChat = () => {
        if (confirm('Clear TN Mitra chat history?')) {
            localStorage.removeItem('tn_mitra_chat_history');
            setMessages([
                {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: '🙏 **Vanakkam!** Chat history reset. How can I guide your journey across Tamil Nadu today?',
                    source: 'cloud',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
            ]);
        }
    };

    const copyMessage = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const quickChips = currentDistrictName
        ? [
            `Compare Bus vs Train vs Cab to ${currentDistrictName}`,
            `Top places in ${currentDistrictName}`,
            `Authentic food in ${currentDistrictName}`,
            `1-day budget plan for ${currentDistrictName}`,
            `Secret hidden gems in ${currentDistrictName}`
        ]
        : [
            'Compare Bus vs Train vs Cab to Madurai',
            'Plan a 3-day budget trip to Kodaikanal',
            'Compare travel options to Ooty',
            'Best seafood in Nagapattinam',
            'Hidden gems in Ariyalur district'
        ];

    return (
        <>
            {/* FLOATING ACTION BUTTON */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                {/* Floating Tooltip if Closed */}
                {!isOpen && (
                    <div className="mb-2.5 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-gold/40 text-[11px] font-bold text-cream shadow-2xl backdrop-blur-md animate-bounce">
                        <Sparkles className="w-3 h-3 text-gold animate-spin" />
                        <span>{currentDistrictName ? `Ask about ${currentDistrictName}` : 'Ask TN Mitra AI'}</span>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-amber-500 to-gold text-slate-950 p-0.5 shadow-2xl shadow-gold/30 hover:shadow-gold/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer"
                    aria-label="Open TN Mitra AI Travel Companion"
                >
                    <div className="w-full h-full bg-[#0A0E1A] rounded-full flex items-center justify-center group-hover:bg-opacity-80 transition-colors">
                        {isOpen ? (
                            <X className="w-6 h-6 text-gold transition-transform group-hover:rotate-90" />
                        ) : (
                            <div className="relative">
                                <Sparkles className="w-6 h-6 text-gold animate-pulse" />
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                        aiSource === 'cloud' ? 'bg-emerald-400' : aiSource === 'local' ? 'bg-amber-400' : 'bg-red-400'
                                    }`} />
                                    <span className={`relative inline-flex rounded-full h-3 w-3 ${
                                        aiSource === 'cloud' ? 'bg-emerald-500' : aiSource === 'local' ? 'bg-amber-500' : 'bg-red-500'
                                    }`} />
                                </span>
                            </div>
                        )}
                    </div>
                </button>
            </div>

            {/* EXPANDABLE CHAT PANEL MODAL */}
            {isOpen && (
                <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[410px] h-[580px] max-h-[85vh] rounded-3xl bg-[#090D18]/95 border border-gold/30 shadow-2xl shadow-black/90 backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
                    {/* Header */}
                    <div className="px-4 py-3.5 bg-gradient-to-r from-navy-card via-[#111A30] to-navy-card border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-gold to-emerald-500 p-0.5 shadow-md shadow-gold/20 flex-shrink-0">
                                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-gold" />
                                </div>
                                {/* Live AI Status Indicator */}
                                <span
                                    title={aiSource === 'cloud' ? 'Connected to Cloud Gemini' : aiSource === 'local' ? 'Connected to Local Ollama Mistral' : 'Running on Offline Knowledge'}
                                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                                        aiSource === 'cloud' ? 'bg-emerald-400' : aiSource === 'local' ? 'bg-amber-400' : 'bg-red-500'
                                    }`}
                                />
                            </div>

                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="font-display font-bold text-sm text-white leading-tight">
                                        TN Mitra AI
                                    </h3>
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-gold/15 text-gold border border-gold/30">
                                        RAG
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        aiSource === 'cloud' ? 'bg-emerald-400' : aiSource === 'local' ? 'bg-amber-400' : 'bg-red-400'
                                    }`} />
                                    {aiSource === 'cloud' ? 'Cloud Gemini' : aiSource === 'local' ? 'Local Ollama' : 'Offline Mode'}
                                </p>
                            </div>
                        </div>

                        {/* Top Action Controls */}
                        <div className="flex items-center gap-1.5 text-gray-400">
                            {/* Fullscreen Tab Link */}
                            <Link
                                href="/ai-guide"
                                className="p-1.5 rounded-lg hover:text-gold hover:bg-white/5 transition-colors"
                                title="Open Full-Page AI Guide"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Link>

                            {/* Voice Output Toggle */}
                            <button
                                type="button"
                                onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    voiceOutputEnabled ? 'text-emerald-400 bg-emerald-500/10' : 'hover:text-white hover:bg-white/5'
                                }`}
                                title={voiceOutputEnabled ? 'Mute AI Voice' : 'Enable AI Voice Reply'}
                            >
                                {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                            </button>

                            {/* Reset History */}
                            <button
                                type="button"
                                onClick={resetChat}
                                className="p-1.5 rounded-lg hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Clear Chat"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>

                            {/* Close */}
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Language Bar */}
                    <div className="px-4 py-1.5 bg-[#0e1526]/80 border-b border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                        <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3 text-gold" />
                            <span>Voice Language:</span>
                        </span>
                        <div className="flex items-center gap-1">
                            {[
                                { id: 'ta-IN', label: 'தமிழ்' },
                                { id: 'en-IN', label: 'English' },
                                { id: 'hi-IN', label: 'हिंदी' },
                            ].map((lang) => (
                                <button
                                    key={lang.id}
                                    type="button"
                                    onClick={() => setVoiceLang(lang.id)}
                                    className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                                        voiceLang === lang.id
                                            ? 'bg-gold/20 text-gold border border-gold/40'
                                            : 'hover:text-white'
                                    }`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin scrollbar-thumb-white/10">
                        {messages.map((msg, index) => {
                            const isBot = msg.role === 'assistant';
                            return (
                                <div
                                    key={msg.id || index}
                                    className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end justify-end'}`}
                                >
                                    {isBot && (
                                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-gold to-amber-600 flex items-center justify-center text-slate-950 font-bold flex-shrink-0 mt-0.5">
                                            <Bot className="w-3.5 h-3.5" />
                                        </div>
                                    )}

                                    <div
                                        className={`group relative max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-lg ${
                                            isBot
                                                ? 'bg-slate-900/90 border border-white/10 text-slate-100 rounded-tl-sm'
                                                : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-br-sm'
                                        }`}
                                    >
                                        {/* Message Content formatted */}
                                        <div className="whitespace-pre-line break-words text-[12px]">
                                            {msg.content}
                                        </div>

                                        {/* RAG Context Sources if any */}
                                        {isBot && msg.rag_sources && msg.rag_sources.length > 0 && (
                                            <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1">
                                                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                                                    📚 Verified Knowledge Sources:
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {msg.rag_sources.slice(0, 3).map((r, i) => (
                                                        <a
                                                            key={i}
                                                            href={r.maps_url || '#'}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 hover:bg-gold/20 text-[10px] text-gray-300 hover:text-gold border border-white/10 transition-colors"
                                                        >
                                                            <MapPin className="w-2.5 h-2.5 text-gold" />
                                                            <span>{r.name} ({r.district})</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer timestamp & copy action */}
                                        <div className="mt-1.5 flex items-center justify-between text-[9px] text-gray-400">
                                            <span>{msg.timestamp}</span>
                                            {isBot && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={() => copyMessage(msg.content, index)}
                                                        className="hover:text-gold cursor-pointer"
                                                        title="Copy text"
                                                    >
                                                        {copiedIndex === index ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {!isBot && (
                                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 flex-shrink-0 mb-0.5">
                                            <User className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex gap-2.5 items-start">
                                <div className="w-6 h-6 rounded-lg bg-gold flex items-center justify-center text-slate-950 flex-shrink-0">
                                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                                </div>
                                <div className="bg-slate-900/90 border border-white/10 rounded-2xl rounded-tl-sm p-3 text-gray-300 text-xs flex items-center gap-2">
                                    <span className="flex gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                                    </span>
                                    <span>TN Mitra is searching tourism dataset...</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested Prompt Chips */}
                    {messages.length <= 2 && (
                        <div className="px-4 py-2 bg-[#0A0F1D] border-t border-white/5">
                            <p className="text-[10px] font-bold text-gray-400 mb-1.5 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-gold" />
                                <span>Suggested Inquiries:</span>
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {quickChips.map((chip, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSendMessage(chip)}
                                        className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-gold/15 border border-white/10 hover:border-gold/30 text-[10px] font-medium text-gray-300 hover:text-gold transition-all text-left cursor-pointer"
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Bar */}
                    <div className="p-3 bg-[#080C16] border-t border-white/10">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="flex items-center gap-2"
                        >
                            {/* Speech Recognition Mic */}
                            <button
                                type="button"
                                onClick={toggleListening}
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
                                    isListening
                                        ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-gold hover:border-gold/40'
                                }`}
                                title={isListening ? 'Listening... click to stop' : 'Speak to TN Mitra'}
                            >
                                {isListening ? <Mic className="w-4 h-4 text-red-400 animate-spin" /> : <Mic className="w-4 h-4" />}
                            </button>

                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={isListening ? 'Listening to your voice...' : 'Ask about places, food, itineraries...'}
                                className="flex-1 bg-slate-900/90 border border-white/10 focus:border-gold/60 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold/40"
                            />

                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isLoading}
                                className="p-2.5 rounded-xl bg-gradient-to-r from-gold to-amber-500 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-md shadow-gold/20 cursor-pointer flex-shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
