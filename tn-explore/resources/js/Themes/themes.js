/**
 * Role-Based Design System Theme Tokens
 * Provides distinct, accessible color tokens for Admin, Vendor, and Tourist experiences.
 */

export const adminTheme = {
    name: 'admin',
    background: '#0B0F19',
    card: '#111827',
    sidebar: '#0F172A',
    primary: '#F59E0B',        // Amber
    primaryHover: '#FBBF24',   // Amber-400 (+10% lightness)
    primaryActive: '#D97706',  // Amber-600 (-10% lightness)
    textReadable: '#FCD34D',   // Amber-300 (WCAG AAA on dark)
    danger: '#F43F5E',         // Rose-500 for fraud alerts
    dangerHover: '#FB7185',
    border: 'rgba(245, 158, 11, 0.25)',
    badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
};

export const vendorTheme = {
    name: 'vendor',
    background: '#0E1B2E',     // Oceanic Navy (distinctly bluer SaaS)
    card: '#16233A',
    sidebar: '#0B1524',
    primary: '#06B6D4',        // Cyan
    primaryHover: '#22D3EE',   // Cyan-400
    primaryActive: '#0891B2',  // Cyan-600
    secondary: '#8B5CF6',      // Violet (chat & AI)
    secondaryHover: '#A78BFA',
    success: '#10B981',        // Emerald (earnings/payouts only)
    textReadable: '#67E8F9',   // Cyan-300
    border: 'rgba(6, 182, 212, 0.25)',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
};

export const touristTheme = {
    name: 'tourist',
    background: '#0B0F19',     // Deep Titanium
    card: '#111827',
    primary: '#E8B44A',        // Sand Gold (brand color)
    primaryHover: '#F3C973',
    primaryActive: '#D49D33',
    secondary: '#10B981',      // Emerald (verified badges only)
    aiGuide: '#9333EA',        // Purple (TN Mitra theme)
    starRating: '#F6C562',     // Temple Gold
    textReadable: '#FDE68A',   // Gold-200
    border: 'rgba(232, 180, 74, 0.25)',
    badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
};

export const trustScoreTheme = {
    highTrust: {
        min: 80,
        color: '#10B981',
        textClass: 'text-emerald-400',
        bgClass: 'bg-emerald-500/20',
        borderClass: 'border-emerald-500/40',
        label: '🟢 High Trust (AI Verified)'
    },
    moderateRisk: {
        min: 50,
        color: '#F59E0B',
        textClass: 'text-amber-400',
        bgClass: 'bg-amber-500/20',
        borderClass: 'border-amber-500/40',
        label: '🟡 Moderate Risk'
    },
    highRisk: {
        min: 0,
        color: '#EF4444',
        textClass: 'text-rose-400',
        bgClass: 'bg-rose-500/20',
        borderClass: 'border-rose-500/40',
        label: '🔴 High Risk Anomaly'
    }
};

export function getTrustColor(score) {
    const s = Number(score) || 0;
    if (s >= 80) return trustScoreTheme.highTrust;
    if (s >= 50) return trustScoreTheme.moderateRisk;
    return trustScoreTheme.highRisk;
}
