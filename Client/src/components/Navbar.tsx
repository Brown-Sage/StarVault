import SearchIcon from '@mui/icons-material/Search'
import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import md5 from 'md5';
import { Star, Menu, X, LogOut, BookOpen } from 'lucide-react';

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
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Scroll-aware navbar background
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const checkAuth = () => {
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
        };

        checkAuth();
        window.addEventListener("auth-change", checkAuth);

        return () => {
            window.removeEventListener("auth-change", checkAuth);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        window.dispatchEvent(new Event("auth-change"));
        setIsLoggedIn(false);
        setAvatarUrl(null);
        setUserMenuOpen(false);
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
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-10 py-3 transition-all duration-500 ${scrolled
                ? 'bg-[#0d0a1a]/90 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-purple-950/20'
                : 'bg-transparent border-b border-transparent'
                }`}>
                {/* Logo */}
                <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
                    <Star className="h-7 w-7 fill-purple-400 text-purple-400 mr-2 group-hover:rotate-[20deg] transition-transform duration-300" />
                    <div className="text-2xl md:text-3xl font-black tracking-tighter bg-gradient-to-r from-fuchsia-200 via-purple-300 to-indigo-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                        StarVault
                    </div>
                </div>

                {/* Navigation Links — desktop */}
                <ul className="hidden lg:flex gap-8 text-gray-400 font-medium text-sm">
                    {[{ label: 'Movies', path: '/category/movies' }, { label: 'TV Shows', path: '/category/tv-shows' }, { label: 'Anime', path: '/category/anime' }].map((item) => (
                        <li key={item.label} className={`cursor-pointer transition-colors duration-200 py-1 ${location.pathname === item.path ? 'text-purple-400 font-semibold' : 'hover:text-purple-400'}`} onClick={() => navigate(item.path)}>
                            {item.label}
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative group/search">
                        <form onSubmit={handleSearch} className="relative flex items-center">
                            <input
                                className={`
                                    py-2 pl-10 pr-4 
                                    bg-white/15 border border-white/25
                                    text-white placeholder-gray-400 
                                    rounded-full outline-none text-sm
                                    focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400/50 focus:bg-white/20
                                    transition-all duration-300
                                    w-[160px] focus:w-[240px] md:focus:w-[300px]
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
                                className="absolute left-3 text-gray-500 group-focus-within/search:text-purple-400 transition-colors"
                                disabled={loading}
                            >
                                <SearchIcon fontSize="small" />
                            </button>
                        </form>

                        {/* Search Results Dropdown */}
                        {showResults && (
                            <div className="absolute top-full right-0 mt-3 w-[320px] md:w-[400px] max-h-[70vh] overflow-y-auto bg-[#13101f]/98 backdrop-blur-2xl border border-white/12 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
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
                                                className="px-4 py-3 hover:bg-white/8 cursor-pointer transition-colors border-b border-white/5 last:border-0 group/item"
                                            >
                                                <div className="flex gap-4">
                                                    <div className="flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden bg-gray-800 shadow-md">
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
                                                        <h3 className="text-gray-100 font-semibold truncate group-hover/item:text-purple-400 transition-colors text-sm">
                                                            {item.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-white/10 text-gray-300">
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

                    {/* User Section */}
                    {isLoggedIn ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 group"
                            >
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="User Avatar"
                                        className="w-9 h-9 rounded-full border-2 border-purple-500/50 object-cover group-hover:border-purple-400 transition-colors shadow-md shadow-purple-900/30"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full border-2 border-purple-500/50 bg-purple-900/40 group-hover:border-purple-400 transition-colors"></div>
                                )}
                            </button>

                            {/* User Dropdown */}
                            {userMenuOpen && (
                                <div className="absolute right-0 top-full mt-3 w-52 bg-[#13101f]/98 backdrop-blur-2xl border border-white/12 rounded-xl shadow-2xl shadow-black/60 overflow-hidden py-1">
                                    <button
                                        onClick={() => { navigate('/my-reviews'); setUserMenuOpen(false); }}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/8 transition-colors"
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        My Reviews
                                    </button>
                                    <div className="border-t border-white/8 mx-3"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="hidden sm:flex items-center gap-2">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-5 py-2 rounded-full text-gray-300 hover:text-white font-medium text-sm transition-all duration-300"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-purple-900/30 hover:shadow-purple-700/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/10"
                            >
                                Sign Up
                            </button>
                        </div>
                    )}

                    {/* Mobile menu toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden text-gray-300 hover:text-white transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </nav>

            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 pt-20 bg-[#0d0a1a]/95 backdrop-blur-xl lg:hidden">
                    <ul className="flex flex-col items-center gap-6 py-8 text-gray-200 font-medium text-lg">
                        {[{ label: 'Movies', path: '/category/movies' }, { label: 'TV Shows', path: '/category/tv-shows' }, { label: 'Anime', path: '/category/anime' }].map((item) => (
                            <li
                                key={item.label}
                                className={`cursor-pointer transition-colors ${location.pathname === item.path ? 'text-purple-400 font-semibold' : 'hover:text-purple-400'}`}
                                onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                            >
                                {item.label}
                            </li>
                        ))}
                        {!isLoggedIn && (
                            <>
                                <li>
                                    <button
                                        onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                                        className="text-gray-300 hover:text-white transition-colors"
                                    >
                                        Login
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                                        className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg"
                                    >
                                        Sign Up
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </>
    );
}