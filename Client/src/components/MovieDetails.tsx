import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchWithRetry } from './HomePage';

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
}

export default function MovieDetails() {
    const { id, type } = useParams();
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showTrailer, setShowTrailer] = useState(false);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                const numericId = id?.split('-')[0];
                if (!numericId || !type) {
                    throw new Error('Invalid movie ID or type');
                }
                const data = await fetchWithRetry<MovieDetails>(`http://localhost:3001/api/${type}/${numericId}`);
                setMovie(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };
        if (id && type) {
            fetchMovieDetails();
        }
    }, [id, type]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
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

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Trailer Modal */}
            {showTrailer && movie.trailerKey && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-90 z-50 flex flex-col items-center">
                    <div className="w-full flex justify-end pt-6 pr-8">
                        <button
                            className="text-white text-4xl font-bold hover:text-red-400 transition-colors"
                            onClick={() => setShowTrailer(false)}
                            aria-label="Close Trailer"
                        >
                            &times;
                        </button>
                    </div>
                    <div className="w-full flex justify-center mt-2">
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
            <div className="w-full bg-gradient-to-r from-[#2d1a1a] to-[#1a1a2d] pb-8">
                <div className="container mx-auto px-4 pt-10 flex flex-col md:flex-row gap-10">
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
                        <div className="flex items-center gap-6 mb-4">
                            {/* User Score */}
                            <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12">
                                    <svg className="w-12 h-12" viewBox="0 0 36 36">
                                        <path
                                            className="text-gray-700"
                                            stroke="#22223b"
                                            strokeWidth="3"
                                            fill="none"
                                            d="M18 2.0845
                                                a 15.9155 15.9155 0 0 1 0 31.831
                                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                        <path
                                            className="text-green-400"
                                            stroke="#4ade80"
                                            strokeWidth="3"
                                            fill="none"
                                            strokeDasharray={`${movie.rating * 10}, 100`}
                                            d="M18 2.0845
                                                a 15.9155 15.9155 0 0 1 0 31.831
                                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                        />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                                        {Math.round(movie.rating * 10)}<span className="text-xs">%</span>
                                    </span>
                                </div>
                                <span className="text-sm text-gray-300 font-semibold">User Score</span>
                                <span className="ml-2 text-2xl">🥳😲😶</span>          will add functionality later 
                            </div>
                            {/* Play Trailer Button */}
                            {movie.trailerKey && (
                                <button
                                    className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold shadow"
                                    onClick={() => setShowTrailer(true)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25v13.5l13.5-6.75-13.5-6.75z" />
                                    </svg>
                                    Play Trailer
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
            {movie.cast && movie.cast.length > 0 && (
                <div className="container mx-auto px-4 py-8">
                    <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Top Billed Cast</h2>
                    <div className="flex overflow-x-auto gap-4 pb-2">
                        {movie.cast.map((artist) => (
                            <div
                                key={artist.id}
                                className="flex-shrink-0 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-md p-2 text-center"
                            >
                                <img
                                    src={artist.profileUrl || 'https://via.placeholder.com/150x225?text=No+Image'}
                                    alt={artist.name}
                                    className="w-32 h-40 object-cover rounded-lg mx-auto mb-2 bg-gray-200"
                                />
                                <div className="font-bold text-black dark:text-white text-md truncate">{artist.name}</div>
                                <div className="text-gray-600 dark:text-gray-300 text-sm truncate">{artist.character}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 