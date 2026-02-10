import { Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Play, TrendingUp } from 'lucide-react';

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
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 px-4 md:px-10">
                    {title}
                </h2>
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
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 group/link font-medium"
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
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-[#13101f]/90 hover:bg-purple-600 text-white p-3 rounded-full opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 backdrop-blur-sm border border-white/15 hover:border-purple-500 hover:scale-110 shadow-xl shadow-black/40"
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
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-[#13101f]/90 hover:bg-purple-600 text-white p-3 rounded-full opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 backdrop-blur-sm border border-white/15 hover:border-purple-500 hover:scale-110 shadow-xl shadow-black/40"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}

                {/* Fade edges */}
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0f0a1e] to-transparent z-[5]"></div>
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0f0a1e] to-transparent z-[5]"></div>
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
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10 group-hover:ring-purple-500/40 transition-all duration-300">
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
                            <div className="bg-purple-600 hover:bg-purple-500 rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl shadow-purple-900/50">
                                <Play className="w-6 h-6 text-white fill-white" />
                            </div>
                        </div>

                        {/* Rating Badge */}
                        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 border border-yellow-500/30">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-bold text-white">{item.rating.toFixed(1)}</span>
                        </div>

                        {/* Type Badge */}
                        <div className="absolute top-2 left-2 bg-purple-600/80 backdrop-blur-sm px-2 py-1 rounded-md">
                            <span className="text-xs font-semibold text-white uppercase tracking-wide">
                                {item.type}
                            </span>
                        </div>
                    </div>

                    {/* Title and Info */}
                    <div className="mt-3">
                        <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-purple-400 transition-colors">
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
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f0a1e] via-[#0f0a1e]/70 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a1e] via-transparent to-[#0f0a1e]/30"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center px-4 md:px-10 lg:px-16 z-10">
                <div className="max-w-3xl space-y-6">
                    {/* Badge */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-black tracking-wide border border-white/15">
                            #{currentIndex + 1}
                        </span>
                        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide shadow-lg shadow-purple-900/50 flex items-center gap-1.5">
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
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-[#13101f]/90 hover:bg-purple-600 text-white p-3 rounded-full backdrop-blur-sm border border-white/15 hover:border-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-xl shadow-black/40"
            >
                <ChevronLeft className="w-7 h-7" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-[#13101f]/90 hover:bg-purple-600 text-white p-3 rounded-full backdrop-blur-sm border border-white/15 hover:border-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-xl shadow-black/40"
            >
                <ChevronRight className="w-7 h-7" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-10 right-8 z-20 flex gap-2">
                {items.slice(0, 10).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${index === currentIndex ? 'w-10 bg-purple-400' : 'w-4 bg-white/25 hover:bg-white/40'}`}
                    />
                ))}
            </div>

            {/* Gradient Overlay Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0f0a1e] to-transparent z-0"></div>
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
            <div className="relative h-[85vh] min-h-[600px] mb-14 overflow-hidden bg-gradient-to-b from-[#1a1030] to-[#0f0a1e]">
                <div className="absolute inset-0 flex items-center px-4 md:px-10 lg:px-16">
                    <div className="max-w-3xl w-full space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-16 bg-white/10 rounded-full animate-pulse"></div>
                            <div className="h-8 w-36 bg-purple-600/30 rounded-full animate-pulse"></div>
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
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f0a1e] via-[#1a1030] to-[#0f0a1e]">
            <Trending />

            <div className="relative">
                <TopRatedMovies />
                <TopRatedTV />
                <PopularMovies />
                <PopularTV />
            </div>

            {/* Footer gradient */}
            <div className="h-24 bg-gradient-to-t from-[#0f0a1e] to-transparent"></div>
        </div>
    );
}