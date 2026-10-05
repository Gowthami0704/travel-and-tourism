import React, { useEffect, useState } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function ThemeToggle({ userTheme = null, className = '' }) {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('tn_theme') || userTheme || 'system';
        }
        return 'system';
    });

    useEffect(() => {
        const root = document.documentElement;
        const applyTheme = (currentTheme) => {
            if (currentTheme === 'dark') {
                root.classList.add('dark');
            } else if (currentTheme === 'light') {
                root.classList.remove('dark');
            } else {
                // System preference
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            }
        };

        applyTheme(theme);
        localStorage.setItem('tn_theme', theme);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme('system');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const handleSelect = (selected) => {
        setTheme(selected);
        localStorage.setItem('tn_theme', selected);
        
        // Optimistically update backend if user is logged in
        if (window.route && route().has('profile.theme')) {
            router.post(route('profile.theme'), { theme: selected }, {
                preserveScroll: true,
                preserveState: true,
                only: [],
            });
        }
    };

    return (
        <div className={`inline-flex items-center p-1 rounded-xl bg-stone-100 dark:bg-slate-800 border border-stone-300 dark:border-slate-700 shadow-sm ${className}`}>
            <button
                type="button"
                onClick={() => handleSelect('light')}
                title="Light mode"
                className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    theme === 'light'
                        ? 'bg-white text-amber-600 shadow-sm font-bold'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
            >
                <Sun className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">Light</span>
            </button>
            <button
                type="button"
                onClick={() => handleSelect('dark')}
                title="Dark mode"
                className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    theme === 'dark'
                        ? 'bg-slate-900 text-amber-300 shadow-sm font-bold'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
            >
                <Moon className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">Dark</span>
            </button>
            <button
                type="button"
                onClick={() => handleSelect('system')}
                title="System preference"
                className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    theme === 'system'
                        ? 'bg-white dark:bg-slate-900 text-stone-900 dark:text-stone-100 shadow-sm font-bold'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
            >
                <Laptop className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">System</span>
            </button>
        </div>
    );
}
