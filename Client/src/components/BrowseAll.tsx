import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Play, ArrowLeft } from 'lucide-react';

interface Tmdb_info {
    id: number;
    title: string;
    type: string;
    rating: number;
    imageUrl: string;
    overview: string;
    releaseDate: string;
}

// Helper function to create URL-friendly slug
function createSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Utility function for fetching data with retry
async function fetchWithRetry<T>(url: string, retries = 3, delay = 1000): Promise<T> {
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

// Skeleton Loader
function SkeletonCard() {
    return (
        <div className="relative group">
            <div className="aspect-[2/3] bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl animate-pulse"></div>
            <div className="mt-3 space-y-2">
                <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded animate-pulse w-1/2"></div>
            </div>
        </div>
    );
}

// Movie Card Component
function MovieCard({ item }: { item: Tmdb_info }) {
    return (
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
                        <div className="bg-emerald-600 hover:bg-emerald-500 rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                            <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 border border-yellow-500/30">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-white">{item.rating.toFixed(1)}</span>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2 bg-emerald-600/90 backdrop-blur-sm px-2 py-1 rounded-md">
                        <span className="text-xs font-semibold text-white uppercase tracking-wide">
                            {item.type}
                        </span>
                    </div>
                </div>

                {/* Title and Info */}
                <div className="mt-3">
                    <h3 className="text-white font-semibold text-sm line-clamp-2 group-hover:text-emerald-400 transition-colors">
                        {item.title}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">
                        {item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'N/A'}
                    </p>
                </div>
            </div>
        </Link>
    );
}

// Category configuration
const categoryConfig: Record<string, { title: string; apiEndpoint: string }> = {
    'trending-now': {
        title: 'Trending Now',
        apiEndpoint: `${import.meta.env.VITE_API_BASE_URL}/api/trending`
    },
    'top-rated-movies': {
        title: 'Top Rated Movies',
        apiEndpoint: `${import.meta.env.VITE_API_BASE_URL}/api/top-rated/movies`
    },
    'top-rated-tv-shows': {
        title: 'Top Rated TV Shows',
        apiEndpoint: `${import.meta.env.VITE_API_BASE_URL}/api/top-rated/tv`
    },
    'popular-movies': {
        title: 'Popular Movies',
        apiEndpoint: `${import.meta.env.VITE_API_BASE_URL}/api/popular/movies`
    },
    'popular-tv-shows': {
        title: 'Popular TV Shows',
        apiEndpoint: `${import.meta.env.VITE_API_BASE_URL}/api/popular/tv`
    },
    'popular-anime': {
        title: 'Popular Anime',
        apiEndpoint: `${import.meta.env.VITE_API_BASE_URL}/api/anime/popular`
    },
    'top-rated-anime': {
        title: 'Top Rated Anime',
        apiEndpoint: `${import.meta.env.VITE_API_BASE_URL}/api/anime/top-rated`
    }
};

export default function BrowseAll() {
    const { category } = useParams<{ category: string }>();
    const navigate = useNavigate();
    const [items, setItems] = useState<Tmdb_info[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const config = category ? categoryConfig[category] : null;

    useEffect(() => {
        if (!config) {
            setError('Invalid category');
            setLoading(false);
            return;
        }

        const fetchContent = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch multiple pages to show more content
                const promises = [];
                for (let i = 1; i <= page; i++) {
                    const url = `${config.apiEndpoint}${config.apiEndpoint.includes('?') ? '&' : '?'}page=${i}`;
                    promises.push(fetchWithRetry<Tmdb_info[]>(url));
                }

                const results = await Promise.all(promises);
                const allItems = results.flat();

                setItems(allItems);
                setHasMore(results[results.length - 1].length > 0);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [category, page, config]);

    const loadMore = () => {
        if (hasMore && !loading) {
            setPage(prev => prev + 1);
        }
    };

    if (!config) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#081a0b] via-[#0e1f10] to-[#081a0b] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Category Not Found</h1>
                    <Link to="/" className="text-emerald-400 hover:text-emerald-300">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#081a0b] via-[#0e1f10] to-[#081a0b]">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-[#081a0b] to-[#081a0b]/80 backdrop-blur-lg border-b border-white/10">
                <div className="container mx-auto px-4 md:px-8 py-6">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="text-sm">Back</span>
                        </button>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {config.title}
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {items.length} {items.length === 1 ? 'item' : 'items'} available
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="container mx-auto px-4 md:px-8 py-8">
                {error ? (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-red-400 text-center">
                        <p className="text-lg font-semibold mb-2">Error loading content</p>
                        <p>{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-red-500/20 hover:bg-red-500/30 px-6 py-2 rounded-lg transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                            {items.map((item) => (
                                <MovieCard key={`${item.id}-${item.type}`} item={item} />
                            ))}

                            {/* Loading Skeletons */}
                            {loading && [...Array(12)].map((_, i) => (
                                <SkeletonCard key={`skeleton-${i}`} />
                            ))}
                        </div>

                        {/* Load More Button */}
                        {!loading && hasMore && items.length > 0 && (
                            <div className="flex justify-center mt-12">
                                <button
                                    onClick={loadMore}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-emerald-600/50"
                                >
                                    Load More
                                </button>
                            </div>
                        )}

                        {/* No More Content */}
                        {!loading && !hasMore && items.length > 0 && (
                            <div className="text-center mt-12 text-gray-400">
                                <p>You've reached the end</p>
                            </div>
                        )}

                        {/* No Items */}
                        {!loading && items.length === 0 && !error && (
                            <div className="text-center mt-12 text-gray-400">
                                <p className="text-xl">No content available</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
