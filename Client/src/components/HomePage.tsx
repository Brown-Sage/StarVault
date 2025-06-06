import { useEffect, useState } from 'react';
import { FcNext } from "react-icons/fc";

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
                return 1;
            } else if (width < 768) { // md
                return 3;
            } else if (width < 1024) { // lg
                return 4;
            } else {
                return 6; // xl and above
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
export function Trending() {
    const [trending, setTrending] = useState<Tmdb_info[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const itemToShow = useResponsiveItemCount();
    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/trending')
                if (!response.ok) {
                    throw new Error('Oopsie ? unable to fetch Trending Media')
                }
                const data = await response.json();
                setTrending(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        };

        fetchTrending()
    }, [])
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-red-500 text-center">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-3xl flex justify-between font-bold text-white mb-6">
                <h1>Trending</h1>
                <button className="text-sm border-1 p-1 rounded-xl">See More</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {trending.slice(0, itemToShow).map((item) => (
                    <div key={item.id} className="bgx-gray-800 rounded-lg overflow-hidden shadow-lg hover:transform hover:scale-105 transition-transform duration-200">
                        <img 
                            src={item.imageUrl} 
                            alt={item.title}
                            className="w-full h-64 object-cover"
                        />
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                <span className="text-yellow-400">★ {item.rating.toFixed(1)}</span>
                            </div>
                            <span className="inline-block apx-2 py-1 text-sm rounded-sm p-1 bg-blue-600 text-white">
                                {item.type}
                            </span>
                            <p className="mt-2 text-gray-300 text-sm line-clamp-2">{item.overview}</p>
                            <p className="mt-2 text-gray-400 text-sm">{item.releaseDate}</p>
                        </div>
                    </div>
                ))}
            </div>
            <FcNext className="flex absolute bg-black top-70 h-17 w-17 rounded-4xl right-4"/>
        </div>
    );
}

// Top Rated Movies Component
export function TopRatedMovies() {
    const [topRatedMovies, setTopRatedMovies] = useState<Tmdb_info[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const itemToShow = useResponsiveItemCount();

    useEffect(() => {
        const fetchTopRatedMovies = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/top-rated/movies');
                if (!response.ok) {
                    throw new Error('Oopsie ! unable to fetch Top-rated Movies');
                }
                const data = await response.json();
                setTopRatedMovies(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchTopRatedMovies();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-red-500 text-center">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-3xl flex justify-between font-bold text-white mb-6">
                <h1>Top Rated Movies</h1>
                <button className="text-sm border-1 p-1 rounded-xl">See More</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {topRatedMovies.slice(0, itemToShow).map((item) => (
                    <div key={item.id} className="bgx-gray-800 rounded-lg overflow-hidden shadow-lg hover:transform hover:scale-105 transition-transform duration-200">
                        <img 
                            src={item.imageUrl} 
                            alt={item.title}
                            className="w-full h-64 object-cover"
                        />
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                <span className="text-yellow-400">★ {item.rating.toFixed(1)}</span>
                            </div>
                            <span className="inline-block apx-2 py-1 text-sm rounded-sm p-1 bg-blue-600 text-white">
                                {item.type}
                            </span>
                            <p className="mt-2 text-gray-300 text-sm line-clamp-2">{item.overview}</p>
                            <p className="mt-2 text-gray-400 text-sm">{item.releaseDate}</p>
                        </div>
                    </div>
                ))}
            </div>
            <FcNext className="flex absolute bg-black top-70 h-17 w-17 rounded-4xl right-4"/>
        </div>
    );
}

// Top Rated TV Shows Component
export function TopRatedTV() {
    const [topRatedTV, setTopRatedTV] = useState<Tmdb_info[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const itemToShow = useResponsiveItemCount();

    useEffect(() => {
        const fetchTopRatedTV = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/top-rated/tv');
                if (!response.ok) {
                    throw new Error('Oopsie ! unable to fetch Top-Rated TV shows');
                }
                const data = await response.json();
                setTopRatedTV(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchTopRatedTV();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-red-500 text-center">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-3xl flex justify-between font-bold text-white mb-6">
                <h1>Top Rated TV Shows</h1>
                <button className="text-sm border-1 p-1 rounded-xl">See More</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {topRatedTV.slice(0, itemToShow).map((item) => (
                    <div key={item.id} className="bgx-gray-800 rounded-lg overflow-hidden shadow-lg hover:transform hover:scale-105 transition-transform duration-200">
                        <img 
                            src={item.imageUrl} 
                            alt={item.title}
                            className="w-full h-64 object-cover"
                        />
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                <span className="text-yellow-400">★ {item.rating.toFixed(1)}</span>
                            </div>
                            <span className="inline-block apx-2 py-1 text-sm rounded-sm p-1 bg-blue-600 text-white">
                                {item.type}
                            </span>
                            <p className="mt-2 text-gray-300 text-sm line-clamp-2">{item.overview}</p>
                            <p className="mt-2 text-gray-400 text-sm">{item.releaseDate}</p>
                        </div>
                    </div>
                ))}
            </div>
            <FcNext className="flex absolute bg-black top-70 h-17 w-17 rounded-4xl right-4"/>
        </div>
    );
}

// Popular Movies Component
export function PopularMovies() {
    const [popularMovies, setPopularMovies] = useState<Tmdb_info[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const itemToShow = useResponsiveItemCount();

    useEffect(() => {
        const fetchPopularMovies = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/popular/movies');
                if (!response.ok) {
                    throw new Error('Oopsie ! unable to fetch the Popular Movies');
                }
                const data = await response.json();
                setPopularMovies(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchPopularMovies();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-red-500 text-center">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-3xl flex justify-between font-bold text-white mb-6">
                <h1>Popular Movies</h1>
                <button className="text-sm border-1 p-1 rounded-xl">See More</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {popularMovies.slice(0, itemToShow).map((item) => (
                    <div key={item.id} className="bgx-gray-800 rounded-lg overflow-hidden shadow-lg hover:transform hover:scale-105 transition-transform duration-200">
                        <img 
                            src={item.imageUrl} 
                            alt={item.title}
                            className="w-full h-64 object-cover"
                        />
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                <span className="text-yellow-400">★ {item.rating.toFixed(1)}</span>
                            </div>
                            <span className="inline-block apx-2 py-1 text-sm rounded-sm p-1 bg-blue-600 text-white">
                                {item.type}
                            </span>
                            <p className="mt-2 text-gray-300 text-sm line-clamp-2">{item.overview}</p>
                            <p className="mt-2 text-gray-400 text-sm">{item.releaseDate}</p>
                        </div>
                    </div>
                ))}
            </div>
            <FcNext className="flex absolute bg-black top-70 h-17 w-17 rounded-4xl right-4"/>
        </div>
    );
}

// Popular TV Shows Component
export function PopularTV() {
    const [popularTV, setPopularTV] = useState<Tmdb_info[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const itemToShow = useResponsiveItemCount();

    useEffect(() => {
        const fetchPopularTV = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/popular/tv');
                if (!response.ok) {
                    throw new Error('Oopsie ! unable to fetch the Popular TV show');
                }
                const data = await response.json();
                setPopularTV(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchPopularTV();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-red-500 text-center">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-3xl flex justify-between font-bold text-white mb-6">
                <h1>Popular TV Shows</h1>
                <button className="text-sm border-1 p-1 rounded-xl">See More</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {popularTV.slice(0, itemToShow).map((item) => (
                    <div key={item.id} className="bgx-gray-800 rounded-lg overflow-hidden shadow-lg hover:transform hover:scale-105 transition-transform duration-200">
                        <img 
                            src={item.imageUrl} 
                            alt={item.title}
                            className="w-full h-64 object-cover"
                        />
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                <span className="text-yellow-400">★ {item.rating.toFixed(1)}</span>
                            </div>
                            <span className="inline-block apx-2 py-1 text-sm rounded-sm p-1 bg-blue-600 text-white">
                                {item.type}
                            </span>
                            <p className="mt-2 text-gray-300 text-sm line-clamp-2">{item.overview}</p>
                            <p className="mt-2 text-gray-400 text-sm">{item.releaseDate}</p>
                        </div>
                    </div>
                ))}
            </div>
            <FcNext className="flex absolute bg-black top-70 h-17 w-17 rounded-4xl right-4"/>
        </div>
    );
}

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gray-900">
            <Trending />
            <TopRatedMovies />
            <TopRatedTV />
            <PopularMovies />
            <PopularTV />
        </div>
    );
}