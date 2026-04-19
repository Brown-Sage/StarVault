import { Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Play, TrendingUp, Sparkles, Clapperboard, Tv, Music4, WandSparkles, Check } from 'lucide-react';
import { type OnboardingPreferences, ARTIST_SUGGESTIONS, MOVIE_TYPE_OPTIONS, FORMAT_OPTIONS, MOOD_OPTIONS, createEmptyPreferences, toggleSelection } from '../lib/preferences';
import { fetchPreferences, saveUserPreferences } from '../api/userApi';

interface Tmdb_info {
    id: number;
    title: string;
    type: string;
    rating: number;
    imageUrl: string;
    backdropUrl?: string;
    overview: string;
    releaseDate: string;
}

function PreferenceChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                selected
                    ? 'border-indigo-400 bg-indigo-500/20 text-white shadow-lg shadow-indigo-900/30'
                    : 'border-white/12 bg-white/5 text-slate-300 hover:border-white/25 hover:bg-white/10 hover:text-white'
            }`}
        >
            {label}
        </button>
    );
}

function OnboardingExperience({ onComplete }: { onComplete: (prefs: OnboardingPreferences) => void }) {
    const [preferences, setPreferences] = useState<OnboardingPreferences>(createEmptyPreferences);
    const [artistInput, setArtistInput] = useState('');
    const [saving, setSaving] = useState(false);

    const selectionCount =
        preferences.favoriteArtists.length +
        preferences.favoriteMovieTypes.length +
        preferences.favoriteFormats.length +
        preferences.favoriteMoods.length;

    const canContinue = selectionCount >= 3;

    const addArtist = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed || preferences.favoriteArtists.includes(trimmed)) return;
        setPreferences((c) => ({ ...c, favoriteArtists: [...c.favoriteArtists, trimmed] }));
        setArtistInput('');
    };

    const finish = async (prefs: OnboardingPreferences) => {
        setSaving(true);
        try {
            await saveUserPreferences(prefs);
            onComplete(prefs);
        } catch (err) {
            console.error('[Onboarding] saveUserPreferences failed:', err);
            onComplete(prefs);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.25),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.18),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_45%,#111827_100%)] pt-24">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:80px_80px] opacity-20" />
            <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-16 md:px-10 lg:flex-row lg:items-start">

                {/* Left sticky panel */}
                <section className="lg:w-[42%] lg:sticky lg:top-28">
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-200">
                        <WandSparkles className="h-4 w-4" />
                        First-time setup
                    </div>
                    <h1 className="mt-6 max-w-xl text-4xl font-black tracking-tight text-white md:text-6xl">
                        Let&apos;s tune StarVault to your taste.
                    </h1>
                    <p className="mt-5 max-w-lg text-base leading-8 text-slate-300">
                        Pick a few artists, formats, moods, and movie types you enjoy. We&apos;ll use this to shape your personalised home feed.
                    </p>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-xl">
                            <Music4 className="mb-3 h-5 w-5 text-pink-300" />
                            <h2 className="text-lg font-bold text-white">Favorite artists</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-400">Music taste signals mood and storytelling preferences.</p>
                        </div>
                        <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-xl">
                            <Clapperboard className="mb-3 h-5 w-5 text-amber-300" />
                            <h2 className="text-lg font-bold text-white">Movie types</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-400">Genres and vibes give us the first personalised rails.</p>
                        </div>
                    </div>
                </section>

                {/* Right form panel */}
                <section className="lg:w-[58%]">
                    <div className="rounded-[2rem] border border-white/12 bg-white/[0.06] p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-8">
                        <div className="flex flex-col gap-3 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Personalize Home</p>
                                <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Choose what influences your recommendations.</h2>
                            </div>
                            <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                                <Check className="h-4 w-4" />
                                {selectionCount} picks selected
                            </div>
                        </div>

                        <div className="mt-8 space-y-8">
                            {/* Artists */}
                            <div>
                                <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Favorite artists</label>
                                <div className="flex flex-col gap-3 md:flex-row">
                                    <input
                                        value={artistInput}
                                        onChange={(e) => setArtistInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArtist(artistInput); } }}
                                        placeholder="Type an artist, composer, or band"
                                        className="w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors focus:border-indigo-400/60"
                                    />
                                    <button type="button" onClick={() => addArtist(artistInput)}
                                        className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-semibold text-white transition-transform hover:scale-[1.02]">
                                        Add
                                    </button>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    {ARTIST_SUGGESTIONS.map((artist) => (
                                        <PreferenceChip key={artist} label={artist}
                                            selected={preferences.favoriteArtists.includes(artist)}
                                            onClick={() => setPreferences((c) => ({ ...c, favoriteArtists: toggleSelection(c.favoriteArtists, artist) }))}
                                        />
                                    ))}
                                </div>
                                {preferences.favoriteArtists.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {preferences.favoriteArtists.map((artist) => (
                                            <button key={artist} type="button"
                                                onClick={() => setPreferences((c) => ({ ...c, favoriteArtists: c.favoriteArtists.filter((a) => a !== artist) }))}
                                                className="rounded-full border border-pink-400/20 bg-pink-500/10 px-3 py-1.5 text-sm font-semibold text-pink-100 transition-colors hover:bg-pink-500/20">
                                                {artist} ×
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Movie types */}
                            <div>
                                <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Favorite movie types</label>
                                <div className="flex flex-wrap gap-3">
                                    {MOVIE_TYPE_OPTIONS.map((type) => (
                                        <PreferenceChip key={type} label={type}
                                            selected={preferences.favoriteMovieTypes.includes(type)}
                                            onClick={() => setPreferences((c) => ({ ...c, favoriteMovieTypes: toggleSelection(c.favoriteMovieTypes, type) }))}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Formats */}
                            <div>
                                <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Favorite formats</label>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {FORMAT_OPTIONS.map((format) => {
                                        const selected = preferences.favoriteFormats.includes(format);
                                        return (
                                            <button key={format} type="button"
                                                onClick={() => setPreferences((c) => ({ ...c, favoriteFormats: toggleSelection(c.favoriteFormats, format) }))}
                                                className={`rounded-3xl border p-4 text-left transition-all duration-300 ${ selected ? 'border-emerald-400/30 bg-emerald-500/10' : 'border-white/12 bg-slate-950/40 hover:border-white/20 hover:bg-white/[0.04]' }`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`rounded-2xl p-3 ${ selected ? 'bg-emerald-400/20 text-emerald-200' : 'bg-white/8 text-slate-300' }`}>
                                                        {format === 'TV Shows' ? <Tv className="h-5 w-5" /> : <Clapperboard className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-bold text-white">{format}</h3>
                                                        <p className="text-sm text-slate-400">Steers what shows up on your home feed.</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Moods */}
                            <div>
                                <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">What moods do you come here for?</label>
                                <div className="flex flex-wrap gap-3">
                                    {MOOD_OPTIONS.map((mood) => (
                                        <PreferenceChip key={mood} label={mood}
                                            selected={preferences.favoriteMoods.includes(mood)}
                                            onClick={() => setPreferences((c) => ({ ...c, favoriteMoods: toggleSelection(c.favoriteMoods, mood) }))}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
                            <p className="max-w-xl text-sm leading-6 text-slate-400">Pick at least 3 things. You can update this in Settings later.</p>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => finish(createEmptyPreferences())}
                                    disabled={saving}
                                    className="rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-slate-300 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50">
                                    Skip for now
                                </button>
                                <button type="button" disabled={!canContinue || saving} onClick={() => finish(preferences)}
                                    className="rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50">
                                    {saving ? 'Saving…' : 'Save my taste profile'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

// ─── Personalized Recommendations Rail ───────────────────────────────────────

function PersonalizedRecommendations({ preferences }: { preferences: OnboardingPreferences }) {
    const [movies, setMovies] = useState<Tmdb_info[]>([]);
    const [loading, setLoading] = useState(true);
    const [seed, setSeed] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Build subtitle from user's actual preferences
    const subtitleParts: string[] = [];
    if (preferences.favoriteArtists.length > 0)
        subtitleParts.push(preferences.favoriteArtists.slice(0, 2).join(' & '));
    if (preferences.favoriteMoods.length > 0)
        subtitleParts.push(preferences.favoriteMoods.slice(0, 2).join(' & ') + ' moods');
    if (preferences.favoriteMovieTypes.length > 0)
        subtitleParts.push(preferences.favoriteMovieTypes.slice(0, 2).join(' & ') + ' films');
    const subtitle = subtitleParts.length > 0
        ? `Curated from your taste in ${subtitleParts.join(', ')}.`
        : 'Curated from your taste profile. Dive into cinematic experiences.';

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                // TODO: replace with AI-generated picks once recommendation engine is ready
                const data = await fetchWithRetry<Tmdb_info[]>(
                    `${import.meta.env.VITE_API_BASE_URL}/api/top-rated/movies`
                );
                const shuffled = [...data].sort(() => 0.5 - Math.random()).slice(0, 12);
                setMovies(shuffled);
            } catch {
                // silently fail, section just won't render
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [seed]);

    if (!loading && movies.length === 0) return null;

    const CARD_GENRE_LABELS = ['Thriller', 'Sci-Fi', 'Drama', 'Mystery', 'Action', 'Romance', 'Horror', 'Comedy'];

    return (
        <section className="px-4 md:px-10 pt-2 pb-10">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-300 mb-3">
                        <Sparkles className="h-3 w-3" />
                        Picked for you
                    </div>
                    <h2 className="text-2xl md:text-[1.75rem] font-black text-white tracking-tight leading-snug">
                        Based on your taste
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-400 max-w-lg leading-relaxed">{subtitle}</p>
                </div>
                <button
                    onClick={() => setSeed(s => s + 1)}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors group mt-1 disabled:opacity-50"
                >
                    {loading ? 'Loading…' : 'Refresh picks'}
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            {/* Scrollable poster row */}
            <div className="relative">
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto pb-3"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {loading
                        ? [...Array(7)].map((_, i) => (
                            <div key={i} className="flex-shrink-0 w-[155px] h-[232px] md:w-[170px] md:h-[255px] rounded-2xl bg-white/[0.07] animate-pulse" />
                        ))
                        : movies.map((movie, idx) => (
                            <Link
                                key={movie.id}
                                to={`/movie/${movie.id}`}
                                className="group flex-shrink-0 relative w-[155px] h-[232px] md:w-[170px] md:h-[255px] rounded-2xl overflow-hidden"
                            >
                                {/* Poster image */}
                                <img
                                    src={movie.imageUrl}
                                    alt={movie.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

                                {/* Top-left badges */}
                                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm rounded-full px-2 py-0.5 w-fit">
                                        <Star className="h-2.5 w-2.5 fill-white text-white" />
                                        <span className="text-[11px] font-bold text-white">{movie.rating.toFixed(1)}</span>
                                    </div>
                                    <div className="bg-black/55 backdrop-blur-sm rounded-full px-2 py-0.5 w-fit">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">
                                            {CARD_GENRE_LABELS[idx % CARD_GENRE_LABELS.length]}
                                        </span>
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
                                    <p className="text-[13px] font-bold text-white leading-tight line-clamp-2">{movie.title}</p>
                                </div>

                                {/* Hover ring */}
                                <div className="absolute inset-0 rounded-2xl ring-2 ring-inset ring-indigo-500/0 group-hover:ring-indigo-400/50 transition-all duration-300" />
                            </Link>
                        ))
                    }
                </div>

                {/* Fade edges */}
                <div className="pointer-events-none absolute left-0 top-0 bottom-3 w-4 bg-gradient-to-r from-[#0f172a] to-transparent" />
                <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-20 bg-gradient-to-l from-[#0f172a] to-transparent" />
            </div>
        </section>
    );
}


// Utility function for fetching data with retry
export async function fetchWithRetry<T>(url: string, retries = 3, delay = 1000): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
    throw new Error('Failed to fetch data after retries');
}

// Helper function to create URL-friendly slug
function createSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Skeleton Loader Component
function SkeletonCard() {
    return (
        <div className="flex-shrink-0 w-[180px] sm:w-[200px] lg:w-[220px]">
            <div className="relative group">
                <div className="aspect-[2/3] bg-gradient-to-br from-white/5 to-white/10 rounded-xl animate-pulse"></div>
                <div className="mt-3 space-y-2">
                    <div className="h-4 bg-white/10 rounded-lg animate-pulse w-3/4"></div>
                    <div className="h-3 bg-white/8 rounded-lg animate-pulse w-1/2"></div>
                </div>
            </div>
        </div>
    );
}

// Content Row Component with Horizontal Scroll
interface ContentRowProps {
    title: string;
    categorySlug: string;
    items: Tmdb_info[];
    loading: boolean;
    error: string | null;
}

function ContentRow({ title, items, loading, error }: ContentRowProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScroll);
            return () => container.removeEventListener('scroll', checkScroll);
        }
    }, [items]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400;
            const newScrollLeft = direction === 'left'
                ? scrollContainerRef.current.scrollLeft - scrollAmount
                : scrollContainerRef.current.scrollLeft + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return (
            <div className="mb-14">
                <div className="px-4 md:px-10 mb-6">
                    <div className="h-8 bg-white/10 rounded-lg animate-pulse w-48"></div>
                </div>
                <div className="relative px-4 md:px-10">
                    <div className="flex gap-4 overflow-hidden">
                        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mb-14 px-4 md:px-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{title}</h2>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
                    Error loading content: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-14 group/section">
            <div className="flex items-center justify-between mb-6 px-4 md:px-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                    {title}
                </h2>
                <Link
                    to={`/browse/${title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 group/link font-medium"
                >
                    See All
                    <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="relative group/scroll">
                {/* Left Arrow */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-[#0d1627]/90 hover:bg-indigo-600 text-white p-3 rounded-full opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 backdrop-blur-sm border border-white/15 hover:border-indigo-500 hover:scale-110 shadow-xl shadow-black/40"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}

                {/* Scrollable Content */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-10 scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {items.map((item) => (
                        <MovieCard key={item.id} item={item} />
                    ))}
                </div>

                {/* Right Arrow */}
                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-[#0d1627]/90 hover:bg-indigo-600 text-white p-3 rounded-full opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 backdrop-blur-sm border border-white/15 hover:border-indigo-500 hover:scale-110 shadow-xl shadow-black/40"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}

                {/* Fade edges */}
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0f172a] to-transparent z-[5]"></div>
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0f172a] to-transparent z-[5]"></div>
            </div>
        </div>
    );
}

// Movie Card Component
function MovieCard({ item }: { item: Tmdb_info }) {
    return (
        <div className="flex-shrink-0 w-[180px] sm:w-[200px] lg:w-[220px]">
            <Link to={`/${item.type}/${item.id}-${createSlug(item.title)}`}>
                <div className="relative group cursor-pointer">
                    {/* Poster Image */}
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10 group-hover:ring-indigo-500/40 transition-all duration-300">
                        <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Play Button on Hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="bg-indigo-600 hover:bg-indigo-500 rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl shadow-indigo-900/50">
                                <Play className="w-6 h-6 text-white fill-white" />
                            </div>
                        </div>

                        {/* Rating Badge */}
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 border border-yellow-500/30">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-bold text-white">{item.rating.toFixed(1)}</span>
                        </div>

                        {/* Type Badge */}
                        <div className="absolute top-2 left-2 bg-indigo-600/80 backdrop-blur-sm px-2 py-1 rounded-md">
                            <span className="text-xs font-semibold text-white uppercase tracking-wide">
                                {item.type}
                            </span>
                        </div>
                    </div>

                    {/* Title and Info */}
                    <div className="mt-3">
                        <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-indigo-400 transition-colors">
                            {item.title}
                        </h3>
                        <p className="text-gray-500 text-xs mt-1">
                            {item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'N/A'}
                        </p>
                    </div>
                </div>
            </Link>
        </div>
    );
}

// Hero Section Component with Carousel
function HeroSection({ items }: { items: Tmdb_info[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (items.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [currentIndex, items.length]);

    const nextSlide = () => {
        if (items.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        if (items.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    if (items.length === 0) return null;

    const featured = items[currentIndex];

    return (
        <div className="relative h-[85vh] min-h-[600px] mb-14 overflow-hidden group">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 transition-opacity duration-700">
                <img
                    src={featured.backdropUrl || featured.imageUrl}
                    alt={featured.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/70 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-[#0f172a]/30"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center px-4 md:px-10 lg:px-16 z-10">
                <div className="max-w-3xl space-y-6">
                    {/* Badge */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-black tracking-wide border border-white/15">
                            #{currentIndex + 1}
                        </span>
                        <span className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide shadow-lg shadow-indigo-900/50 flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4" />
                            Trending Now
                        </span>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/15">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-white font-bold text-sm">{Number(featured.rating).toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/15">
                            <span className="text-gray-200 font-semibold uppercase text-xs tracking-wide">{featured.type}</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight drop-shadow-2xl">
                        {featured.title}
                    </h1>

                    {/* Overview */}
                    <p className="text-gray-300 text-lg md:text-xl line-clamp-3 max-w-2xl font-medium leading-relaxed">
                        {featured.overview}
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-4 pt-2">
                        <Link
                            to={`/${featured.type}/${featured.id}-${createSlug(featured.title)}`}
                            className="bg-white text-black hover:bg-gray-100 px-8 py-3.5 rounded-full font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-xl text-sm"
                        >
                            <Play className="w-5 h-5 fill-black" />
                            More Info
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-[#0d1627]/90 hover:bg-indigo-600 text-white p-3 rounded-full backdrop-blur-sm border border-white/15 hover:border-indigo-500 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-xl shadow-black/40"
            >
                <ChevronLeft className="w-7 h-7" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-[#0d1627]/90 hover:bg-indigo-600 text-white p-3 rounded-full backdrop-blur-sm border border-white/15 hover:border-indigo-500 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-xl shadow-black/40"
            >
                <ChevronRight className="w-7 h-7" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-10 right-8 z-20 flex gap-2">
                {items.slice(0, 10).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${index === currentIndex ? 'w-10 bg-indigo-400' : 'w-4 bg-white/25 hover:bg-white/40'}`}
                    />
                ))}
            </div>

            {/* Gradient Overlay Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0f172a] to-transparent z-0"></div>
        </div>
    );
}

// Main Section Components
export function Trending() {
    const [trending, setTrending] = useState<Tmdb_info[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const data = await fetchWithRetry<Tmdb_info[]>(`${import.meta.env.VITE_API_BASE_URL}/api/trending`);
                setTrending(data);
            } catch (err) {
                console.error("Failed to fetch trending:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []);

    const carouselItems = trending.slice(0, 10);

    if (loading || carouselItems.length === 0) {
        return (
            <div className="relative h-[85vh] min-h-[600px] mb-14 overflow-hidden bg-gradient-to-b from-[#1e293b] to-[#0f172a]">
                <div className="absolute inset-0 flex items-center px-4 md:px-10 lg:px-16">
                    <div className="max-w-3xl w-full space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-16 bg-white/10 rounded-full animate-pulse"></div>
                            <div className="h-8 w-36 bg-indigo-600/30 rounded-full animate-pulse"></div>
                        </div>
                        <div className="h-16 md:h-24 bg-white/10 rounded-xl animate-pulse w-3/4"></div>
                        <div className="space-y-3 max-w-2xl">
                            <div className="h-5 bg-white/8 rounded-lg animate-pulse w-full"></div>
                            <div className="h-5 bg-white/8 rounded-lg animate-pulse w-5/6"></div>
                        </div>
                        <div className="h-12 w-40 bg-white/10 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <HeroSection items={carouselItems} />
    );
}

export function TopRatedMovies() {
    const [topRatedMovies, setTopRatedMovies] = useState<Tmdb_info[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTopRatedMovies = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchWithRetry<Tmdb_info[]>(`${import.meta.env.VITE_API_BASE_URL}/api/top-rated/movies`);
                setTopRatedMovies(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchTopRatedMovies();
    }, []);

    return <ContentRow title="Top Rated Movies" categorySlug="top-rated-movies" items={topRatedMovies} loading={loading} error={error} />;
}

export function TopRatedTV() {
    const [topRatedTV, setTopRatedTV] = useState<Tmdb_info[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTopRatedTV = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchWithRetry<Tmdb_info[]>(`${import.meta.env.VITE_API_BASE_URL}/api/top-rated/tv`);
                setTopRatedTV(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchTopRatedTV();
    }, []);

    return <ContentRow title="Top Rated TV Shows" categorySlug="top-rated-tv-shows" items={topRatedTV} loading={loading} error={error} />;
}

export function PopularMovies() {
    const [popularMovies, setPopularMovies] = useState<Tmdb_info[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPopularMovies = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchWithRetry<Tmdb_info[]>(`${import.meta.env.VITE_API_BASE_URL}/api/popular/movies`);
                setPopularMovies(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchPopularMovies();
    }, []);

    return <ContentRow title="Popular Movies" categorySlug="popular-movies" items={popularMovies} loading={loading} error={error} />;
}

export function PopularTV() {
    const [popularTV, setPopularTV] = useState<Tmdb_info[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPopularTV = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchWithRetry<Tmdb_info[]>(`${import.meta.env.VITE_API_BASE_URL}/api/popular/tv`);
                setPopularTV(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchPopularTV();
    }, []);

    return <ContentRow title="Popular TV Shows" categorySlug="popular-tv-shows" items={popularTV} loading={loading} error={error} />;
}

export default function HomePage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [preferences, setPreferences] = useState<OnboardingPreferences | null>(null);
    const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

    const loadPreferences = async () => {
        try {
            const data = await fetchPreferences();
            setOnboardingCompleted(data.onboardingCompleted);
            if (data.onboardingCompleted) {
                setPreferences(data.preferences);
            }
        } catch {
            // Not logged in or API error — silently ignore
            setOnboardingCompleted(null);
        }
    };

    useEffect(() => {
        const token = window.localStorage.getItem('token');
        const loggedIn = Boolean(token);
        setIsLoggedIn(loggedIn);

        if (loggedIn) loadPreferences();

        const onAuthChange = () => {
            const loggedInNow = Boolean(window.localStorage.getItem('token'));
            setIsLoggedIn(loggedInNow);
            if (loggedInNow) {
                loadPreferences();
            } else {
                setPreferences(null);
                setOnboardingCompleted(null);
            }
        };

        window.addEventListener('auth-change', onAuthChange);
        return () => window.removeEventListener('auth-change', onAuthChange);
    }, []);

    // Show full-screen onboarding for new users (logged in but not yet completed)
    if (isLoggedIn && onboardingCompleted === false) {
        return (
            <OnboardingExperience
                onComplete={(prefs) => {
                    setOnboardingCompleted(true);
                    setPreferences(prefs);
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a]">
            <Trending />

            {isLoggedIn && preferences && (
                <PersonalizedRecommendations preferences={preferences} />
            )}
            <div className="relative">
                <TopRatedMovies />
                <TopRatedTV />
                <PopularMovies />
                <PopularTV />
            </div>
            <div className="h-24 bg-gradient-to-t from-[#0f172a] to-transparent" />
        </div>
    );
}
