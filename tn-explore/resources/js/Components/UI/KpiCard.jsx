import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

/**
 * Universal KPI Metric Card
 * Follows strict semantic color rules:
 * - neutral by default
 * - amber only when pending count > 0
 * - red only when problem/fraud count > 0
 * - teal only for verified/good state
 */
export default function KpiCard({
    title,
    value,
    subtext,
    icon: Icon,
    variant = 'neutral', // 'neutral' | 'pending' | 'danger' | 'verified'
    actionHref,
    actionLabel,
    className = ''
}) {
    // Determine tone classes based on semantic variant
    const variantStyles = {
        neutral: {
            card: 'border-[var(--border)] bg-[var(--card)]',
            iconWrap: 'text-[var(--muted)] bg-[var(--border)]/40',
            value: 'text-[var(--text)]',
            badge: 'text-[var(--muted)]',
            link: 'text-[var(--muted)] hover:text-[var(--text)]',
        },
        pending: {
            card: 'border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/20',
            iconWrap: 'text-amber-600 dark:text-amber-400 bg-amber-500/15',
            value: 'text-amber-600 dark:text-amber-400',
            badge: 'text-amber-600 dark:text-amber-400',
            link: 'text-amber-600 dark:text-amber-400 hover:underline font-bold',
        },
        danger: {
            card: 'border-rose-500/40 bg-rose-500/5 dark:bg-rose-950/20',
            iconWrap: 'text-rose-600 dark:text-rose-400 bg-rose-500/15',
            value: 'text-rose-600 dark:text-rose-400',
            badge: 'text-rose-600 dark:text-rose-400',
            link: 'text-rose-600 dark:text-rose-400 hover:underline font-bold',
        },
        verified: {
            card: 'border-[var(--verified)]/40 bg-[var(--verified)]/5 dark:bg-teal-950/20',
            iconWrap: 'text-[var(--verified)] bg-[var(--verified)]/15',
            value: 'text-[var(--verified)]',
            badge: 'text-[var(--verified)]',
            link: 'text-[var(--verified)] hover:underline font-bold',
        },
    };

    const style = variantStyles[variant] || variantStyles.neutral;

    const valStr = String(value ?? 0);
    const fontSizeClass = valStr.length > 12
        ? 'text-lg sm:text-xl font-bold'
        : valStr.length > 7
        ? 'text-xl sm:text-2xl font-bold'
        : 'text-2xl sm:text-3xl font-extrabold';

    return (
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition-all duration-200 ${style.card} ${className}`}>
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]" title={title}>
                    {title}
                </span>
                {Icon && (
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${style.iconWrap}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                )}
            </div>

            <div className="my-2.5">
                <div 
                    className={`${fontSizeClass} tracking-tight font-sans tabular-nums truncate whitespace-nowrap ${style.value}`}
                    title={valStr}
                >
                    {value ?? 0}
                </div>
                {subtext && (
                    <p className="text-[11px] text-[var(--muted)] mt-0.5" title={subtext}>
                        {subtext}
                    </p>
                )}
            </div>

            {actionHref && (
                <div className="pt-2 border-t border-[var(--border)]/60">
                    <Link
                        href={actionHref}
                        className={`text-xs flex items-center gap-1 transition-colors ${style.link}`}
                    >
                        <span>{actionLabel || 'View Details'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}
        </div>
    );
}
