import SearchIcon from '@mui/icons-material/Search'
import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import md5 from 'md5';

interface Tmdb_info {
    id: number;
    title: string;
    type: string;
    rating: number;
    imageUrl: string;
    overview: string;
    releaseDate: string;
}

export default function Navbar() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Tmdb_info[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const navigate = useNavigate();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("userEmail");

        if (token) {
            setIsLoggedIn(true);
            if (email) {
                setAvatarUrl(`https://www.gravatar.com/avatar/${md5(email.trim().toLowerCase())}?d=identicon`);
            }
        } else {
            setIsLoggedIn(false);
            setAvatarUrl(null);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        setIsLoggedIn(false);
        setAvatarUrl(null);
        navigate('/');
    };

    const performSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setShowResults(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/search?query=${encodeURIComponent(query.trim())}`);
            if (!response.ok) {
                throw new Error('Search failed');
            }
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        performSearch(searchQuery);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (query.trim() === '') {
            setShowResults(false);
            setSearchResults([]);
            return;
        }

        timeoutRef.current = setTimeout(() => {
            performSearch(query);
        }, 1000);
    };

    const handleResultClick = (item: Tmdb_info) => {
        const slug = `${item.id}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
        navigate(`/${item.type}/${slug}`);
        setShowResults(false);
        setSearchQuery('');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-black/60 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
            {/* Logo Section */}
            <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
                <div className="text-3xl font-black tracking-tighter bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                    StarVault
                </div>
            </div>

            {/* Navigation Links (Placeholder for future) */}
            <ul className="hidden md:flex gap-8 text-gray-300 font-medium">
                {['Movies', 'TV Shows', 'Anime'].map((item) => (
                    <li key={item} className="hover:text-white cursor-pointer transition-colors relative group">
                        {item}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-fuchsia-500 to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                    </li>
                ))}
            </ul>

            <div className="flex items-center gap-6">
                {/* Search Section */}
                <div className="relative group/search">
                    <form onSubmit={handleSearch} className="relative flex items-center">
                        <input
                            className={`
                                py-2.5 pl-10 pr-4 
                                bg-white/5 border border-white/10 
                                text-white placeholder-gray-400 
                                rounded-full outline-none 
                                focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-white/10
                                transition-all duration-300
                                w-[180px] focus:w-[280px] md:focus:w-[320px]
                            `}
                            type="text"
                            placeholder='Search...'
                            value={searchQuery}
                            onChange={handleChange}
                            onFocus={() => {
                                if (searchResults.length > 0 || loading) {
                                    setShowResults(true);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            className="absolute left-3 text-gray-400 group-focus-within/search:text-purple-400 transition-colors"
                            disabled={loading}
                        >
                            <SearchIcon fontSize="small" />
                        </button>
                    </form>

                    {/* Search Results Dropdown */}
                    {showResults && (
                        <div className="absolute top-full right-0 mt-4 w-[320px] md:w-[400px] max-h-[70vh] overflow-y-auto bg-[#0f0f13]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3 text-purple-300">
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
                                        <span className="text-sm font-medium">Searching the galaxy...</span>
                                    </div>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="py-2">
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Top Results
                                    </div>
                                    {searchResults.map((item) => (
                                        <div
                                            key={`${item.type}-${item.id}`}
                                            onClick={() => handleResultClick(item)}
                                            className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0 group/item"
                                        >
                                            <div className="flex gap-4">
                                                <div className="flex-shrink-0 w-12 h-16 rounded-md overflow-hidden bg-gray-800 shadow-md">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                                            <span className="text-xs text-gray-500">N/A</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-gray-100 font-semibold truncate group-hover/item:text-purple-400 transition-colors">
                                                        {item.title}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/10 text-gray-300">
                                                            {item.type === 'movie' ? 'Movie' : 'TV'}
                                                        </span>
                                                        {item.rating > 0 && (
                                                            <div className="flex items-center gap-1 text-xs text-yellow-500">
                                                                <span>★</span>
                                                                <span>{item.rating.toFixed(1)}</span>
                                                            </div>
                                                        )}
                                                        <span className="text-xs text-gray-500">
                                                            {item.releaseDate ? new Date(item.releaseDate).getFullYear() : ''}
                                                        </span>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-gray-400 font-medium">No results found</p>
                                    <p className="text-gray-600 text-sm mt-1">Try searching for something else</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Login/Attributes Section */}
                {isLoggedIn ? (
                    <div className="flex items-center gap-4">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="User Avatar"
                                className="w-10 h-10 rounded-full border border-green-500 object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full border border-gray-500 bg-gray-700"></div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-full text-white font-semibold text-sm hover:text-red-400 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden sm:block px-6 py-2.5 rounded-full text-white font-semibold text-sm hover:text-purple-400 transition-all duration-300"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="hidden sm:block px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-purple-900/30 hover:shadow-purple-700/50 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/10"
                        >
                            Sign Up
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}