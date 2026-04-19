export type AccentColor = 'indigo' | 'violet' | 'emerald' | 'rose' | 'amber';

export interface AccentTheme {
    /** solid ring / dot color */
    solid: string;
    /** faint background tint */
    bg: string;
    /** text color */
    text: string;
    /** border color */
    border: string;
    /** subtle shadow tint */
    shadow: string;
    /** Tailwind bg class for the color swatch circle */
    swatchClass: string;
}

export const ACCENT_THEMES: Record<AccentColor, AccentTheme> = {
    indigo: {
        solid: '#6366f1',
        bg: 'rgba(99, 102, 241, 0.10)',
        text: '#818cf8',
        border: 'rgba(99, 102, 241, 0.22)',
        shadow: '0 8px 24px rgba(67, 56, 202, 0.22)',
        swatchClass: 'bg-indigo-500',
    },
    violet: {
        solid: '#8b5cf6',
        bg: 'rgba(139, 92, 246, 0.10)',
        text: '#a78bfa',
        border: 'rgba(139, 92, 246, 0.22)',
        shadow: '0 8px 24px rgba(109, 40, 217, 0.22)',
        swatchClass: 'bg-violet-500',
    },
    emerald: {
        solid: '#10b981',
        bg: 'rgba(16, 185, 129, 0.10)',
        text: '#34d399',
        border: 'rgba(16, 185, 129, 0.22)',
        shadow: '0 8px 24px rgba(6, 95, 70, 0.22)',
        swatchClass: 'bg-emerald-500',
    },
    rose: {
        solid: '#f43f5e',
        bg: 'rgba(244, 63, 94, 0.10)',
        text: '#fb7185',
        border: 'rgba(244, 63, 94, 0.22)',
        shadow: '0 8px 24px rgba(136, 19, 55, 0.22)',
        swatchClass: 'bg-rose-500',
    },
    amber: {
        solid: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.10)',
        text: '#fbbf24',
        border: 'rgba(245, 158, 11, 0.22)',
        shadow: '0 8px 24px rgba(146, 64, 14, 0.22)',
        swatchClass: 'bg-amber-500',
    },
};

export function getAccent(color: string | undefined): AccentTheme {
    return ACCENT_THEMES[(color as AccentColor) ?? 'indigo'] ?? ACCENT_THEMES.indigo;
}
