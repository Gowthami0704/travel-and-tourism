import React from 'react';
import { useLanguage } from '@/Contexts/LanguageContext';
import { Languages } from 'lucide-react';

export default function LanguageToggle({ className = '' }) {
    const { lang, toggleLang } = useLanguage();

    return (
        <button
            type="button"
            onClick={toggleLang}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-sm ${
                lang === 'ta'
                    ? 'bg-maroon-50 text-maroon-700 border-maroon-300 hover:bg-maroon-100 font-tamil'
                    : 'bg-turmeric-50 text-turmeric-800 border-turmeric-300 hover:bg-turmeric-100'
            } ${className}`}
            title="Toggle English / தமிழ்"
        >
            <Languages className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'தமிழ் (TA)' : 'English (EN)'}</span>
        </button>
    );
}
