import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('tn_theme') || 'system';
        }
        return 'system';
    });

    const applyThemeToDom = (mode) => {
        const root = document.documentElement;
        if (mode === 'dark') {
            root.classList.add('dark');
        } else if (mode === 'light') {
            root.classList.remove('dark');
        } else {
            // System mode
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    };

    useEffect(() => {
        applyThemeToDom(theme);
        if (typeof window !== 'undefined') {
            localStorage.setItem('tn_theme', theme);
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleSysChange = () => {
            if (theme === 'system') {
                applyThemeToDom('system');
            }
        };

        mediaQuery.addEventListener('change', handleSysChange);
        return () => mediaQuery.removeEventListener('change', handleSysChange);
    }, [theme]);

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
        if (typeof window !== 'undefined') {
            localStorage.setItem('tn_theme', newTheme);
        }
        if (typeof window !== 'undefined' && window.route && route().has('profile.theme')) {
            router.post(route('profile.theme'), { theme: newTheme }, {
                preserveScroll: true,
                preserveState: true,
                only: [],
            });
        }
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        return {
            theme: 'system',
            setTheme: () => {},
            toggleTheme: () => {},
            isDark: false,
        };
    }
    return context;
}
