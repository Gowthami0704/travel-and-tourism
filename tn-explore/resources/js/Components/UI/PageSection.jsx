import React from 'react';

/**
 * Universal Page Section Container
 */
export default function PageSection({
    title,
    subtitle,
    tag,
    action,
    children,
    className = '',
    contentClassName = '',
    headerClassName = '',
}) {
    return (
        <section className={`py-6 sm:py-8 ${className}`}>
            {(title || subtitle || tag || action) && (
                <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 ${headerClassName}`}>
                    <div>
                        {tag && (
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] mb-1 block">
                                {tag}
                            </span>
                        )}
                        {title && (
                            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--text)] tracking-tight">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 max-w-2xl leading-relaxed">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {action && <div className="flex-shrink-0">{action}</div>}
                </div>
            )}
            <div className={contentClassName}>{children}</div>
        </section>
    );
}
