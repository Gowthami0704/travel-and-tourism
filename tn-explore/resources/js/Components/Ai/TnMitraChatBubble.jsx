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
                content: `✨ **Welcome! I am TN Mitra**, your AI Smart Travel Companion for Tamil Nadu.\n\n${welcomeDistrictText}`,
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

    const toggleVoiceOutput = () => {
        if (voiceOutputEnabled && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setVoiceOutputEnabled((prev) => !prev);
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
            const replyContent = data.reply || 'Welcome! I am having trouble fetching suggestions. Please try again.';
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
                    content: '✨ **Welcome!** Chat history reset. How can I guide your journey across Tamil Nadu today?',
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
            {/* FLOATING ACTION BUTTON - Safe margins, clean round button */}
            <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex items-center justify-center">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[var(--primary)] text-white dark:text-[#14110F] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-180 flex items-center justify-center cursor-pointer border border-[var(--border)]"
                    aria-label="Open TN Mitra AI Assistant"
                    title="TN Mitra AI Assistant"
                >
                    {isOpen ? (
                        <X className="w-6 h-6" strokeWidth={1.5} />
                    ) : (
                        <Sparkles className="w-6 h-6" strokeWidth={1.5} />
                    )}
                </button>
            </div>

            {/* EXPANDABLE CHAT PANEL MODAL (Full Screen on Mobile < md, 410px on Desktop) */}
            {isOpen && (
                <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 z-50 w-full md:w-[410px] h-[100dvh] md:h-[580px] md:max-h-[85vh] rounded-none md:rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-2xl shadow-stone-900/15 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
                    {/* Header */}
                    <div className="px-4 py-3.5 bg-gradient-to-r from-[#FAF7F0] via-amber-50/40 to-[#FAF7F0] dark:from-stone-800 dark:via-stone-850 dark:to-stone-800 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-teal-600 p-0.5 shadow-sm flex-shrink-0">
                                <div className="w-full h-full bg-white dark:bg-stone-900 rounded-[10px] flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                {/* Live AI Status Indicator */}
                                <span
                                    title={aiSource === 'cloud' ? 'Connected to Cloud Gemini' : aiSource === 'local' ? 'Connected to Local Ollama Mistral' : 'Running on Offline Knowledge'}
                                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-stone-900 ${
                                        aiSource === 'cloud' ? 'bg-emerald-500' : aiSource === 'local' ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                />
                            </div>

                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="font-display font-bold text-sm text-stone-900 dark:text-white leading-tight">
                                        TN Mitra AI
                                    </h3>
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                                        RAG
                                    </span>
                                </div>
                                <p className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1 font-medium">
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        aiSource === 'cloud' ? 'bg-emerald-500' : aiSource === 'local' ? 'bg-amber-500' : 'bg-red-500'
                                    }`} />
                                    {aiSource === 'cloud' ? 'Cloud Gemini' : aiSource === 'local' ? 'Local Ollama' : 'Offline Mode'}
                                </p>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1.5">
                            {/* Fullscreen Tab Link */}
                            <Link
                                href="/ai-guide"
                                className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-700 transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shadow-xs"
                                title="Open Full-Page AI Guide"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Link>

                            {/* Voice Output Toggle */}
                            <button
                                type="button"
                                onClick={toggleVoiceOutput}
                                className={`p-2 rounded-xl border transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shadow-xs ${
                                    voiceOutputEnabled
                                        ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-400 text-amber-800 dark:text-amber-300'
                                        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-700'
                                }`}
                                title={voiceOutputEnabled ? 'Voice Output ON' : 'Voice Output OFF'}
                            >
                                {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                            </button>

                            {/* Clear Conversation */}
                            <button
                                type="button"
                                onClick={resetChat}
                                className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shadow-xs"
                                title="Reset Conversation"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>

                            {/* Close Modal */}
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shadow-xs"
                                title="Close Window"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Language Bar */}
                    <div className="px-4 py-1.5 bg-stone-50 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400">
                        <span className="flex items-center gap-1 font-medium">
                            <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
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
                                    className={`px-2.5 py-0.5 rounded-md font-semibold text-xs transition-all cursor-pointer ${
                                        voiceLang === lang.id
                                            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-xs'
                                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                                    }`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-[#FAF7F0] dark:bg-stone-950 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700">
                        {messages.map((msg, index) => {
                            const isBot = msg.role === 'assistant';
                            return (
                                <div
                                    key={msg.id || index}
                                    className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end justify-end'}`}
                                >
                                    {isBot && (
                                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-teal-600 flex items-center justify-center text-white font-bold flex-shrink-0 mt-0.5 shadow-xs">
                                            <Bot className="w-3.5 h-3.5" />
                                        </div>
                                    )}

                                    <div
                                        className={`group relative max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-xs ${
                                            isBot
                                                ? 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-tl-xs'
                                                : 'bg-gradient-to-r from-teal-600 to-emerald-700 text-white rounded-br-xs shadow-sm'
                                        }`}
                                    >
                                        {/* Message Content formatted */}
                                        <div className="whitespace-pre-line break-words text-[12px]">
                                            {msg.content}
                                        </div>

                                        {/* RAG Context Sources if any */}
                                        {isBot && msg.rag_sources && msg.rag_sources.length > 0 && (
                                            <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800 space-y-1.5">
                                                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                                                    📚 Verified Knowledge Sources:
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {msg.rag_sources.slice(0, 3).map((r, i) => (
                                                        <a
                                                            key={i}
                                                            href={r.maps_url || '#'}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-[10px] text-stone-700 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-300 border border-stone-200 dark:border-stone-700 hover:border-amber-300 transition-colors"
                                                        >
                                                            <MapPin className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                                                            <span>{r.name} ({r.district})</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer timestamp & copy action */}
                                        <div className="mt-2 flex items-center justify-between text-[9px] text-stone-400 dark:text-stone-500">
                                            <span>{msg.timestamp}</span>
                                            {isBot && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={() => copyMessage(msg.content, index)}
                                                        className="hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer p-0.5"
                                                        title="Copy text"
                                                    >
                                                        {copiedIndex === index ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {!isBot && (
                                        <div className="w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/40 border border-teal-300 dark:border-teal-700 flex items-center justify-center text-teal-800 dark:text-teal-300 flex-shrink-0 mb-0.5 shadow-xs">
                                            <User className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex gap-2.5 items-start">
                                <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                                </div>
                                <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl rounded-tl-xs p-3 text-stone-600 dark:text-stone-300 text-xs flex items-center gap-2 shadow-xs">
                                    <span className="flex gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce" />
                                    </span>
                                    <span>TN Mitra is searching tourism dataset...</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested Prompt Chips */}
                    {messages.length <= 2 && (
                        <div className="px-4 py-2.5 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
                            <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 mb-1.5 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                <span>Suggested Inquiries:</span>
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {quickChips.map((chip, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSendMessage(chip)}
                                        className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-900/30 border border-stone-200 dark:border-stone-700 hover:border-amber-300 text-[10px] font-medium text-stone-700 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-300 transition-all text-left cursor-pointer"
                                    >
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Bar */}
                    <div className="p-3 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
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
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex-shrink-0 shadow-xs ${
                                    isListening
                                        ? 'bg-rose-100 dark:bg-rose-950/40 border-rose-400 text-rose-600 animate-pulse'
                                        : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-amber-800 hover:border-amber-400'
                                }`}
                                title={isListening ? 'Listening... click to stop' : 'Speak to TN Mitra'}
                            >
                                {isListening ? <Mic className="w-4 h-4 text-rose-500 animate-spin" /> : <Mic className="w-4 h-4" />}
                            </button>

                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={isListening ? 'Listening to your voice...' : 'Ask about places, food, itineraries...'}
                                className="flex-1 bg-stone-50 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 focus:border-teal-500 rounded-xl px-3.5 py-2 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:bg-white transition-all"
                            />

                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isLoading}
                                className="p-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-md shadow-teal-700/20 cursor-pointer flex-shrink-0"
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
