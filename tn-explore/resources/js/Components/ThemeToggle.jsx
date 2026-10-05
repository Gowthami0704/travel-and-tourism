import React from 'react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

export default function ThemeToggle({ className = '', showLabels = false }) {
    const { theme, setTheme } = useTheme();

    return (
        <div className={`inline-flex items-center p-0.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 shadow-xs ${className}`}>
            <button
                type="button"
                onClick={() => setTheme('light')}
                title="Light mode"
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    theme === 'light'
                        ? 'bg-white text-amber-600 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
            >
                <Sun className="w-3.5 h-3.5" />
                {showLabels && <span className="text-[10px]">Light</span>}
            </button>

            <button
                type="button"
                onClick={() => setTheme('dark')}
                title="Dark mode"
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    theme === 'dark'
                        ? 'bg-stone-900 text-amber-300 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
            >
                <Moon className="w-3.5 h-3.5" />
                {showLabels && <span className="text-[10px]">Dark</span>}
            </button>

            <button
                type="button"
                onClick={() => setTheme('system')}
                title="System mode"
                className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    theme === 'system'
                        ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
            >
                <Laptop className="w-3.5 h-3.5" />
                {showLabels && <span className="text-[10px]">Auto</span>}
            </button>
        </div>
    );
}
