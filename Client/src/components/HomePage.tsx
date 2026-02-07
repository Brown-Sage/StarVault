import { Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Play } from 'lucide-react';

interface Tmdb_info {
    id: number;
    title: string;
    type: string;
    rating: number;
    imageUrl: string;
    overview: string;
    releaseDate: string;
}

const useResponsiveItemCount = () => {
    const [itemCount, setItemCount] = useState(6);

    useEffect(() => {
        const calculateItemCount = () => {
            const width = window.innerWidth;
            if (width < 640) { // sm
                return 2;
            } else if (width < 768) { // md
                return 3;
            } else if (width < 1024) { // lg
                return 4;
            } else if (width < 1280) { // xl
                return 5;
            } else {
                return 6; // 2xl and above
            }
        };

        const handleResize = () => {
            setItemCount(calculateItemCount());
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return itemCount;
};

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
                <div className="aspect-[2/3] bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl animate-pulse"></div>
                <div className="mt-3 space-y-2">
                    <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded animate-pulse w-1/2"></div>
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

function ContentRow({ title, categorySlug, items, loading, error }: ContentRowProps) {
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
            <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 px-4 md:px-8">
                    {title}
                </h2>
                <div className="relative px-4 md:px-8">
                    <div className="flex gap-4 overflow-hidden">
                        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mb-12 px-4 md:px-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{title}</h2>
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-red-400">
                    Error loading content: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-12 group/section">
            <div className="flex items-center justify-between mb-6 px-4 md:px-8">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {title}
                </h2>
                <Link
                    to={`/browse/${title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 group/link"
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
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black/90 text-white p-3 rounded-full opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:scale-110"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}

                {/* Scrollable Content */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-8 scroll-smooth"
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
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black/90 text-white p-3 rounded-full opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:scale-110"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}
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
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-800">
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
                            <div className="bg-purple-600 hover:bg-purple-500 rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                                <Play className="w-6 h-6 text-white fill-white" />
                            </div>
                        </div>

                        {/* Rating Badge */}
                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 border border-yellow-500/30">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs font-bold text-white">{item.rating.toFixed(1)}</span>
                        </div>

                        {/* Type Badge */}
                        <div className="absolute top-2 left-2 bg-purple-600/90 backdrop-blur-sm px-2 py-1 rounded-md">
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
                        <p className="text-gray-400 text-xs mt-1">
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
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        if (items.length === 0) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 8000); // Change slide every 8 seconds
        return () => clearInterval(interval);
    }, [currentIndex, items.length]);

    const nextSlide = () => {
        if (items.length === 0 || isTransitioning) return;
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 500);
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        if (items.length === 0 || isTransitioning) return;
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 500);
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    if (items.length === 0) return null;

    const featured = items[currentIndex];

    return (
        <div className="relative h-[85vh] min-h-[600px] mb-12 overflow-hidden group">
            {/* Background Image with Overlay */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
                <img
                    src={featured.imageUrl}
                    alt={featured.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0118] via-transparent to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center px-4 md:px-8 lg:px-16 z-10">
                <div className={`max-w-3xl space-y-6 transition-all duration-700 transform ${isTransitioning ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
                    {/* Badge */}
                    <div className="flex items-center gap-3">
                        <span className="bg-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide shadow-lg shadow-purple-900/50">
                            Trending Now
                        </span>
                        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-white font-bold">{Number(featured.rating).toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                            <span className="text-gray-300 font-semibold uppercase text-xs">{featured.type}</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                        {featured.title}
                    </h1>

                    {/* Overview */}
                    <p className="text-gray-300 text-lg md:text-xl line-clamp-3 max-w-2xl font-medium drop-shadow-md">
                        {featured.overview}
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-4 pt-4">
                        <Link
                            to={`/${featured.type}/${featured.id}-${createSlug(featured.title)}`}
                            className="bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-full font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-xl"
                        >
                            <Play className="w-5 h-5 fill-black" />
                            Play Now
                        </Link>
                        <Link
                            to={`/${featured.type}/${featured.id}-${createSlug(featured.title)}`}
                            className="bg-gray-800/60 hover:bg-gray-700/80 text-white px-8 py-4 rounded-full font-bold backdrop-blur-md border border-white/10 transition-all duration-300 hover:scale-105"
                        >
                            More Info
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
            >
                <ChevronRight className="w-8 h-8" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-8 right-8 z-20 flex gap-2">
                {items.slice(0, 10).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-white' : 'w-4 bg-white/30 hover:bg-white/50'}`}
                    />
                ))}
            </div>
            {/* Gradient Overlay Bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0118] to-transparent z-0"></div>
        </div>
    );
}

// Main Section Components
export function Trending() {
    const [trending, setTrending] = useState<Tmdb_info[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchWithRetry<Tmdb_info[]>('http://localhost:3001/api/trending');
                setTrending(data);
            } catch (err) {
                console.error("Failed to fetch trending:", err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []);

    // Take top 5 items for the carousel
    const carouselItems = trending.slice(0, 10);

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
                const data = await fetchWithRetry<Tmdb_info[]>('http://localhost:3001/api/top-rated/movies');
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
                const data = await fetchWithRetry<Tmdb_info[]>('http://localhost:3001/api/top-rated/tv');
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
                const data = await fetchWithRetry<Tmdb_info[]>('http://localhost:3001/api/popular/movies');
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
                const data = await fetchWithRetry<Tmdb_info[]>('http://localhost:3001/api/popular/tv');
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
        <div className="min-h-screen bg-gradient-to-b from-[#0a0118] via-[#1a0a2e] to-[#0a0118]">
            <Trending />
            <TopRatedMovies />
            <TopRatedTV />
            <PopularMovies />
            <PopularTV />

            {/* Bottom Gradient */}
            <div className="h-32 bg-gradient-to-t from-[#0a0118] to-transparent"></div>
        </div>
    );
}