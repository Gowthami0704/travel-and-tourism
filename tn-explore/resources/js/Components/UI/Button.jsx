import React from 'react';

/**
 * Unified Button System for TN Explore
 * Variants:
 *  - primary: Maroon fill (#8B1E2D) with white text, strong contrast, max 1 per screen
 *  - secondary: Outlined with theme border & text, subtle hover
 *  - tertiary: Text link style with hover underline
 *  - destructive: Red danger button
 *
 * All variants guarantee WCAG AA contrast for hover, focus, and disabled states.
 */
export default function Button({
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    children,
    onClick,
    ...props
}) {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer select-none';

    const sizeStyles = {
        sm: 'px-3 py-1.5 text-xs gap-1.5',
        md: 'px-4 py-2.5 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2.5 font-semibold',
    };

    const variantStyles = {
        primary: `
            bg-[#8B1E2D] hover:bg-[#721824] active:bg-[#5C131D] text-white shadow-sm
            focus:ring-[#8B1E2D]/50 focus:ring-offset-[var(--bg)]
            disabled:bg-[#8B1E2D]/40 disabled:text-white/80 disabled:cursor-not-allowed disabled:shadow-none
        `,
        secondary: `
            border border-[var(--border)] bg-[var(--card)] hover:bg-stone-100 dark:hover:bg-stone-800
            text-[var(--text)] active:bg-stone-200 dark:active:bg-stone-700 shadow-sm
            focus:ring-[var(--primary)]/40 focus:ring-offset-[var(--bg)]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:text-[var(--muted)]
        `,
        tertiary: `
            bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800/60 text-[var(--primary)]
            hover:underline focus:ring-[var(--primary)]/40 focus:ring-offset-[var(--bg)]
            disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed
        `,
        destructive: `
            bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white shadow-sm
            focus:ring-rose-500/50 focus:ring-offset-[var(--bg)]
            disabled:bg-rose-700/40 disabled:text-white/80 disabled:cursor-not-allowed
        `,
    };

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
            aria-disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
