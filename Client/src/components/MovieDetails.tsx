import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight, Eye, Bookmark, Heart } from 'lucide-react';
import { toggleUserMedia, getUserMediaStatus } from '../api/userMediaApi';
import { fetchWithRetry } from './HomePage';
import { getReviews } from './reviewApi';
import { createReview, getUserReview, updateReview, addReply, type Review } from "./reviewPostApi";


interface CastMember {
    id: number;
    name: string;
    character: string;
    profileUrl: string | null;
}

interface Crew {
    directors: string[];
    writers: string[];
}

interface WatchProvider {
    name: string;
    logoUrl: string;
}

interface WatchProviders {
    link: string | null;
    flatrate: WatchProvider[];
    rent: WatchProvider[];
    buy: WatchProvider[];
}

interface MovieDetails {
    id: number;
    title: string;
    type: string;
    rating: number;
    imageUrl: string;
    overview: string;
    releaseDate: string;
    genres?: string[];
    runtime?: number;
    status?: string;
    tagline?: string;
    numberOfSeasons?: number;
    numberOfEpisodes?: number;
    budget?: number;
    revenue?: number;
    cast?: CastMember[];
    crew?: Crew;
    trailerKey?: string;
    watchProviders?: WatchProviders | null;
}

function CastSection({ cast }: { cast: CastMember[] }) {
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
    }, [cast]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            const newScrollLeft = direction === 'left'
                ? scrollContainerRef.current.scrollLeft - scrollAmount
                : scrollContainerRef.current.scrollLeft + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 group/section">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                <span className="bg-indigo-600 w-1 h-8 rounded-full"></span>
                Top Billed Cast
            </h2>
            <div className="relative group/scroll">
                {/* Left Arrow */}
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black/90 text-white p-2 rounded-full opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:scale-110 shadow-lg"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}

                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {cast.map((artist) => (
                        <Link
                            key={artist.id}
                            to={`/person/${artist.id}-${artist.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
                            className="flex-shrink-0 w-36 md:w-44 group"
                        >
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-gray-800 shadow-lg border border-white/5">
                                <img
                                    src={artist.profileUrl || 'https://via.placeholder.com/300x450?text=No+Image'}
                                    alt={artist.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div className="px-1">
                                <h3 className="text-white font-bold text-sm md:text-base leading-tight truncate group-hover:text-indigo-400 transition-colors">
                                    {artist.name}
                                </h3>
                                <p className="text-gray-400 text-xs md:text-sm truncate mt-1">
                                    {artist.character}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Right Arrow */}
                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black/90 text-white p-2 rounded-full opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 backdrop-blur-sm border border-white/10 hover:scale-110 shadow-lg"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}

export default function MovieDetails() {
    const { id, type } = useParams();
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showTrailer, setShowTrailer] = useState(false);
    const [isWatched, setIsWatched] = useState(false);
    const [isWatchlist, setIsWatchlist] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [userReview, setUserReview] = useState<Review | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [rating, setRating] = useState(10);
    const [comment, setComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyComment, setReplyComment] = useState("");
    const [token, setToken] = useState(localStorage.getItem("token"));

    useEffect(() => {
        const handleAuthChange = () => {
            setToken(localStorage.getItem("token"));
        };
        window.addEventListener("auth-change", handleAuthChange);
        return () => window.removeEventListener("auth-change", handleAuthChange);
    }, []);



    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                const numericId = id?.split('-')[0];
                if (!numericId || !type) {
                    throw new Error('Invalid movie ID or type');
                }
                const data = await fetchWithRetry<MovieDetails>(`${import.meta.env.VITE_API_BASE_URL}/api/${type}/${numericId}`);
                setMovie(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };
        if (id && type) {
            fetchMovieDetails();
            getReviews(id.toString()).then(setReviews);

            if (token) {
                const numericId = id.split('-')[0];
                getUserMediaStatus(numericId).then(status => {
                    setIsWatched(status.isWatched);
                    setIsWatchlist(status.isWatchlist);
                    setIsFavorite(status.isFavorite);
                });

                getUserReview(id.toString()).then(review => {
                    if (review) {
                        setUserReview(review);
                        setRating(review.rating);
                        setComment(review.comment);
                    } else {
                        setUserReview(null);
                        setRating(10);
                        setComment("");
                    }
                });
            }
        }
    }, [id, type, token]);

    const handleAction = async (action: 'toggleWatched' | 'toggleWatchlist' | 'toggleFavorite') => {
        if (!movie || actionLoading) return;

        // Optimistic UI update
        if (action === 'toggleWatched') {
            const newState = !isWatched;
            setIsWatched(newState);
            if (newState) setIsWatchlist(false);
        }
        if (action === 'toggleWatchlist') {
            const newState = !isWatchlist;
            setIsWatchlist(newState);
            if (newState) setIsWatched(false);
        }
        if (action === 'toggleFavorite') setIsFavorite(!isFavorite);

        try {
            setActionLoading(true);
            const response = await toggleUserMedia({
                mediaId: movie.id.toString(),
                mediaType: type as 'movie' | 'tv',
                mediaTitle: movie.title,
                mediaPoster: movie.imageUrl,
                mediaReleaseDate: movie.releaseDate,
                action
            });

            // Sync with server response to be sure
            setIsWatched(response.isWatched);
            setIsWatchlist(response.isWatchlist);
            setIsFavorite(response.isFavorite);
        } catch (error) {
            // Revert on error
            if (action === 'toggleWatched') setIsWatched(!isWatched);
            if (action === 'toggleWatchlist') setIsWatchlist(!isWatchlist);
            if (action === 'toggleFavorite') setIsFavorite(!isFavorite);
            console.error('Action failed:', error);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] flex justify-center items-center">
                <div className="text-red-500 text-xl">{error || 'Movie not found'}</div>
            </div>
        );
    }

    const getYear = (date: string) => date ? new Date(date).getFullYear() : '';
    const formatRuntime = (min?: number) => {
        if (!min) return '';
        const h = Math.floor(min / 60);
        const m = min % 60;
        return `${h > 0 ? h + 'h ' : ''}${m}m`;
    };

    const handleSubmitReview = async () => {
        if (!id || !type || !movie) {
            alert("Cannot post review: Missing movie details");
            return;
        }

        try {
            if (userReview) {
                // Update existing review
                const updated = await updateReview(userReview._id, rating, comment);
                setUserReview(updated);
                setIsEditing(false);
                alert("Review updated");
            } else {
                // Create new review
                await createReview(
                    id,
                    type,
                    movie.title,
                    movie.imageUrl,
                    movie.releaseDate,
                    rating,
                    comment
                );
                // Fetch the new review to update state
                const newReview = await getUserReview(id.toString());
                setUserReview(newReview);
                alert("Review posted");
            }
            // Refresh reviews list
            getReviews(id.toString()).then(setReviews);
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review");
        }
    };

    const handleReplySubmit = async (reviewId: string) => {
        if (!replyComment.trim()) return;
        try {
            const updatedReview = await addReply(reviewId, replyComment);
            setReviews(prevReviews => prevReviews.map(r => r._id === reviewId ? updatedReview : r));
            setReplyComment("");
            setReplyingTo(null);
        } catch (error) {
            console.error("Error submitting reply:", error);
            alert("Failed to submit reply");
        }
    };


    // Helper to generate direct links for Indian platforms
    const getProviderLink = (providerName: string) => {
        if (!movie) return '#';
        const titleEncoded = encodeURIComponent(movie.title);
        const nameLower = providerName.toLowerCase();

        if (nameLower.includes('netflix')) return `https://www.netflix.com/search?q=${titleEncoded}`;
        if (nameLower.includes('prime video') || nameLower.includes('amazon')) return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${titleEncoded}`;
        if (nameLower.includes('hotstar')) return `https://www.hotstar.com/in/search?q=${titleEncoded}`;
        if (nameLower.includes('jiocinema')) return `https://www.jiocinema.com/search/${titleEncoded}`;
        if (nameLower.includes('zee5')) return `https://www.zee5.com/search?q=${titleEncoded}`;
        if (nameLower.includes('sonyliv')) return `https://www.sonyliv.com/search?q=${titleEncoded}`;
        if (nameLower.includes('apple')) return `https://tv.apple.com/in/search?term=${titleEncoded}`;
        if (nameLower.includes('google play')) return `https://play.google.com/store/search?q=${titleEncoded}&c=movies`;
        if (nameLower.includes('crunchyroll')) return `https://www.crunchyroll.com/search?q=${titleEncoded}`;

        // Fallback to TMDB link
        return movie.watchProviders?.link || '#';
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
            {/* Trailer Modal */}
            {showTrailer && movie.trailerKey && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-start">
                    <div className="absolute inset-0 bg-opacity-70 backdrop-blur-sm"></div>
                    <div className="relative w-full flex justify-end pt-6 pr-8 z-10">
                        <button
                            className="text-white text-4xl font-bold hover:text-red-400 transition-colors"
                            onClick={() => setShowTrailer(false)}
                            aria-label="Close Trailer"
                        >
                            &times;
                        </button>
                    </div>
                    <div className="relative w-full flex justify-center mt-2 z-10">
                        <div className="w-full max-w-3xl aspect-video">
                            <iframe
                                className="w-full h-full rounded-xl"
                                src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1`}
                                title="Trailer"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
            <div className="w-full bg-gradient-to-r from-[#1e2a4a] to-[#1e293b] pb-8">
                <div className="container mx-auto px-4 pt-20 flex flex-col md:flex-row gap-10">
                    {/* Poster */}
                    <div className="flex-shrink-0 w-full md:w-80 lg:w-96">
                        <img
                            src={movie.imageUrl}
                            alt={movie.title}
                            className="w-full rounded-2xl shadow-2xl object-cover"
                        />

                    </div>
                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-4xl font-bold mr-2">{movie.title}</h1>
                            <span className="text-2xl text-gray-400 font-light">({getYear(movie.releaseDate)})</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-4 text-lg">
                            <span className="border px-2 py-0.5 rounded text-xs font-semibold border-gray-500">
                                {movie.releaseDate}
                            </span>
                            {movie.genres && (
                                <span>{movie.genres.join(', ')}</span>
                            )}
                            {movie.runtime && (
                                <span>{formatRuntime(movie.runtime)}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-6 mb-6">
                            {/* Rating Block */}
                            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                                <span className="text-2xl font-bold text-white tracking-tight">
                                    {movie.rating ? movie.rating.toFixed(1) : "N/A"}
                                </span>
                                <div className="h-4 w-px bg-white/20 mx-1"></div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((index) => {
                                        const fillPercentage = Math.min(Math.max((movie.rating - (index - 1) * 2) / 2 * 100, 0), 100);
                                        return (
                                            <div key={index} className="relative">
                                                <Star className="w-5 h-5 text-gray-600 fill-gray-600/20" />
                                                <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${fillPercentage}%` }}>
                                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Actions Divider */}
                            <div className="h-8 w-px bg-white/10"></div>

                            {/* User Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleAction('toggleWatchlist')}
                                    className={`p-3 rounded-full transition-all duration-300 ${isWatchlist ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]' : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'}`}
                                    title={isWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                                >
                                    <Bookmark className={`w-5 h-5 ${isWatchlist ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                    onClick={() => handleAction('toggleWatched')}
                                    className={`p-3 rounded-full transition-all duration-300 ${isWatched ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]' : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'}`}
                                    title={isWatched ? "Mark as Unwatched" : "Mark as Watched"}
                                >
                                    <Eye className={`w-5 h-5 ${isWatched ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                    onClick={() => handleAction('toggleFavorite')}
                                    className={`p-3 rounded-full transition-all duration-300 ${isFavorite ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'}`}
                                    title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                                >
                                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                                </button>
                            </div>

                            {/* Actions Divider */}
                            {movie.trailerKey && (
                                <div className="h-8 w-px bg-white/10"></div>
                            )}

                            {/* Play Trailer Button */}
                            {movie.trailerKey && (
                                <button
                                    className="group flex items-center gap-3 bg-white hover:bg-gray-200 text-black px-6 py-2.5 rounded-full font-bold shadow-lg shadow-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
                                    onClick={() => setShowTrailer(true)}
                                >
                                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white ml-0.5">
                                            <path d="M5.25 5.25v13.5l13.5-6.75-13.5-6.75z" />
                                        </svg>
                                    </div>
                                    <span>Watch Trailer</span>
                                </button>
                            )}
                        </div>
                        {movie.tagline && (
                            <p className="italic text-xl text-gray-400 mb-2">{movie.tagline}</p>
                        )}
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold mb-1">Overview</h2>
                            <p className="text-gray-200 text-lg">{movie.overview}</p>
                        </div>
                        {/* Crew */}
                        {movie.crew && (
                            <div className="mb-2">
                                {movie.crew.directors && movie.crew.directors.length > 0 && (
                                    <div className="font-semibold text-white">
                                        {movie.crew.directors.join(', ')}
                                        <span className="text-gray-400 font-normal ml-2">Director{movie.crew.directors.length > 1 ? 's' : ''}</span>
                                    </div>
                                )}
                                {movie.crew.writers && movie.crew.writers.length > 0 && (
                                    <div className="font-semibold text-white">
                                        {movie.crew.writers.join(', ')}
                                        <span className="text-gray-400 font-normal ml-2">Writer{movie.crew.writers.length > 1 ? 's' : ''}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Cast Section */}
            {movie.cast && movie.cast.length > 0 && <CastSection cast={movie.cast} />}

            {/* Where to Watch Section */}
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                    <span className="bg-indigo-600 w-1 h-8 rounded-full"></span>
                    Where to Watch (India)
                </h2>
                {movie.watchProviders && (movie.watchProviders.flatrate.length > 0 || movie.watchProviders.rent.length > 0 || movie.watchProviders.buy.length > 0) ? (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl space-y-6">
                        {movie.watchProviders.flatrate.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3">Stream</h3>
                                <div className="flex flex-wrap gap-3">
                                    {movie.watchProviders.flatrate.map((provider) => (
                                        <a
                                            key={provider.name}
                                            href={getProviderLink(provider.name)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center gap-3 bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/40 rounded-xl px-4 py-3 transition-all duration-300"
                                            title={`Watch on ${provider.name}`}
                                        >
                                            <img src={provider.logoUrl} alt={provider.name} className="w-10 h-10 rounded-lg object-cover" />
                                            <span className="text-gray-200 font-medium text-sm group-hover:text-white transition-colors">{provider.name}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        {movie.watchProviders.rent.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3">Rent</h3>
                                <div className="flex flex-wrap gap-3">
                                    {movie.watchProviders.rent.map((provider) => (
                                        <a
                                            key={provider.name}
                                            href={getProviderLink(provider.name)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center gap-3 bg-white/5 hover:bg-yellow-600/20 border border-white/10 hover:border-yellow-500/40 rounded-xl px-4 py-3 transition-all duration-300"
                                            title={`Rent on ${provider.name}`}
                                        >
                                            <img src={provider.logoUrl} alt={provider.name} className="w-10 h-10 rounded-lg object-cover" />
                                            <span className="text-gray-200 font-medium text-sm group-hover:text-white transition-colors">{provider.name}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        {movie.watchProviders.buy.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3">Buy</h3>
                                <div className="flex flex-wrap gap-3">
                                    {movie.watchProviders.buy.map((provider) => (
                                        <a
                                            key={provider.name}
                                            href={getProviderLink(provider.name)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center gap-3 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 rounded-xl px-4 py-3 transition-all duration-300"
                                            title={`Buy on ${provider.name}`}
                                        >
                                            <img src={provider.logoUrl} alt={provider.name} className="w-10 h-10 rounded-lg object-cover" />
                                            <span className="text-gray-200 font-medium text-sm group-hover:text-white transition-colors">{provider.name}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        <p className="text-gray-500 text-xs pt-2 border-t border-white/5">
                            Streaming info provided by JustWatch via TMDB. Direct links where available.
                        </p>
                    </div>
                ) : (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl text-center">
                        <p className="text-gray-400">Not currently available for streaming in India</p>
                    </div>
                )}
            </div>

            {/* Write Review Section */}
            <div className="container mx-auto px-4 py-8">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl">
                    <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                        <span className="bg-indigo-600 w-1 h-8 rounded-full"></span>
                        Write a Review
                    </h3>

                    {token ? (
                        userReview && !isEditing ? (
                            <div className="bg-gray-800 p-6 rounded-xl border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-xl font-bold text-white">Your Review</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="font-bold text-yellow-500">{userReview.rating}/10</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-lg italic mb-6 break-words">"{userReview.comment}"</p>
                                <button
                                    onClick={() => {
                                        setIsEditing(true);
                                        setRating(userReview.rating);
                                        setComment(userReview.comment);
                                    }}
                                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                                >
                                    Edit Review
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-gray-400 text-sm font-medium mb-2">Rating</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => setRating(num)}
                                                className={`
                                                    w-10 h-10 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-110
                                                    ${rating === num
                                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400 ring-offset-2 ring-offset-gray-900'
                                                        : 'bg-black/40 text-gray-400 hover:bg-gray-700 hover:text-white border border-white/10'
                                                    }
                                                `}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-sm font-medium mb-2">Your Review</label>
                                    <textarea
                                        placeholder="Share your thoughts about the movie..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="w-full bg-black/40 text-white border border-white/10 rounded-xl py-4 px-5 min-h-[120px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-500 resize-y"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleSubmitReview}
                                        className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-900/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto"
                                    >
                                        {isEditing ? 'Update Review' : 'Submit Review'}
                                    </button>

                                    {isEditing && (
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                if (userReview) {
                                                    setRating(userReview.rating);
                                                    setComment(userReview.comment);
                                                }
                                            }}
                                            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-xl transition-all w-full md:w-auto"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-400 text-lg mb-4">
                                Want to share your thoughts?
                            </p>
                            <Link
                                to="/login"
                                className="inline-block bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-full transition-all border border-white/10 hover:border-white/30 backdrop-blur-md"
                            >
                                Login to write a review
                            </Link>
                        </div>
                    )}
                </div>
            </div>


            {/* Reviews Section */}
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold mb-4 text-white">Reviews</h2>
                {reviews.length === 0 ? (
                    <p className="text-gray-400">No reviews yet</p>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review: any) => (
                            <div key={review._id} className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg">
                                            {(review.user?.email?.[0] || 'U').toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm">
                                                {review.user?.email?.split('@')[0] || 'Unknown User'}
                                            </div>
                                            <div className="text-gray-400 text-xs">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-yellow-500 font-bold text-sm">{review.rating}</span>
                                    </div>
                                </div>
                                <p className="text-gray-300 text-base mb-4 leading-relaxed break-words">{review.comment}</p>

                                {/* Replies Section */}
                                <div className="mt-4 pl-4 border-l-2 border-gray-700 space-y-4">
                                    {review.replies?.map((reply: any) => (
                                        <div key={reply._id} className="bg-slate-950/50 p-3 rounded-lg border border-gray-700/50">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-indigo-400 text-xs">
                                                    {reply.user?.email?.split('@')[0] || 'Unknown User'}
                                                </span>
                                                <span className="text-gray-500 text-xs">
                                                    • {new Date(reply.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-300 text-sm break-words">{reply.comment}</p>
                                        </div>
                                    ))}

                                    {/* Reply Form */}
                                    {token && (
                                        <div className="mt-3">
                                            {replyingTo === review._id ? (
                                                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <textarea
                                                        value={replyComment}
                                                        onChange={(e) => setReplyComment(e.target.value)}
                                                        placeholder="Add a reply..."
                                                        className="w-full bg-slate-950 text-white rounded-lg p-3 text-sm outline-none border border-gray-700 focus:border-indigo-500 resize-none h-24"
                                                        autoFocus
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setReplyingTo(null);
                                                                setReplyComment("");
                                                            }}
                                                            className="px-3 py-1.5 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleReplySubmit(review._id)}
                                                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors"
                                                            disabled={!replyComment.trim()}
                                                        >
                                                            Reply
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(review._id);
                                                        setReplyComment("");
                                                    }}
                                                    className="text-gray-400 hover:text-white text-sm font-semibold flex items-center gap-1 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                                    Reply
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
} 