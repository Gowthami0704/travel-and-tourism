import React from 'react';

/**
 * Universal Card Component
 * Surface 2: Default Card Surface (bg-[var(--card)])
 * Surface 3: Raised Card Surface (bg-[var(--card-raised)])
 */
export default function Card({ 
    children, 
    className = '', 
    raised = false, 
    hover = false,
    padding = 'p-5 sm:p-6',
    ...props 
}) {
    return (
        <div
            className={`rounded-2xl border transition-all duration-200 ${
                raised
                    ? 'bg-[var(--card-raised)] border-[var(--border)] shadow-md'
                    : 'bg-[var(--card)] border-[var(--border)] shadow-sm'
            } ${
                hover ? 'hover:shadow-md hover:border-[var(--muted)]/40 hover:-translate-y-0.5' : ''
            } ${padding} text-[var(--text)] ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
