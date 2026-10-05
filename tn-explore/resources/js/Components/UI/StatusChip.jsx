import React from 'react';
import { ShieldCheck, AlertTriangle, Clock, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Universal Status Chip / Badge
 * Follows theme tokens and WCAG AA contrast
 */
export default function StatusChip({
    status = 'neutral', // 'verified' | 'pending' | 'danger' | 'warning' | 'neutral'
    label,
    icon: CustomIcon,
    size = 'sm', // 'xs' | 'sm' | 'md'
    className = ''
}) {
    const configs = {
        verified: {
            badge: 'bg-[var(--verified)]/15 text-[var(--verified)] border-[var(--verified)]/30',
            defaultIcon: ShieldCheck,
        },
        pending: {
            badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
            defaultIcon: Clock,
        },
        warning: {
            badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
            defaultIcon: AlertTriangle,
        },
        danger: {
            badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
            defaultIcon: AlertTriangle,
        },
        neutral: {
            badge: 'bg-[var(--border)]/50 text-[var(--muted)] border-[var(--border)]',
            defaultIcon: CheckCircle2,
        },
    };

    const config = configs[status] || configs.neutral;
    const Icon = CustomIcon || config.defaultIcon;

    const sizeClasses = {
        xs: 'px-2 py-0.5 text-[10px] gap-1',
        sm: 'px-2.5 py-1 text-xs gap-1.5',
        md: 'px-3 py-1.5 text-sm gap-2',
    };

    return (
        <span
            className={`inline-flex items-center font-semibold rounded-full border transition-colors ${config.badge} ${sizeClasses[size] || sizeClasses.sm} ${className}`}
        >
            {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
            <span>{label}</span>
        </span>
    );
}
