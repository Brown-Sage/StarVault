import SearchIcon from '@mui/icons-material/Search'
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/search?query=${encodeURIComponent(searchQuery.trim())}`);
            if (!response.ok) {
                throw new Error('Search failed');
            }
            const data = await response.json();
            setSearchResults(data);
            setShowResults(true);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleResultClick = (item: Tmdb_info) => {
        const slug = `${item.id}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
        navigate(`/${item.type}/${slug}`);
        setShowResults(false);
        setSearchQuery('');
    };

    return (
        <nav className="flex font-bold text-blue-300 h-15 justify-around bg-black relative">
            <div className="flex items-center w-60 flex-column p-2">
                <div className='text-fuchsia-500 text-3xl' >StarVault</div>
                {/* <div>picture</div> */}
            </div>
            <ul className=" w-1/3 text-xl h-full flex flex-column items-center justify-center gap-20 p-2">
                <li>Movies</li>
                <li>Anime</li>
                <li>Books</li>
            </ul>
            <div className="flex items-center flex-column p-2 relative">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <input 
                        className='p-2 bg-blue-800 h-9 text-amber-50 placeholder-amber-50 outline-0 rounded-2xl' 
                        type="text" 
                        placeholder='Search' 
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (e.target.value.trim() === '') {
                                setShowResults(false);
                            }
                        }}
                        onFocus={() => {
                            if (searchResults.length > 0) {
                                setShowResults(true);
                            }
                        }}
                    />
                    <button 
                        type="submit" 
                        className="text-amber-50 hover:text-blue-300 cursor-pointer"
                        disabled={loading}
                    >
                        <SearchIcon />
                    </button>
                </form>
                {showResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 mt-2 w-96 max-h-96 overflow-y-auto bg-gray-800 rounded-lg shadow-lg z-50">
                        {searchResults.map((item) => (
                            <div
                                key={`${item.type}-${item.id}`}
                                onClick={() => handleResultClick(item)}
                                className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                            >
                                <div className="flex gap-3">
                                    {item.imageUrl && (
                                        <img 
                                            src={item.imageUrl} 
                                            alt={item.title}
                                            className="w-16 h-24 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-white font-semibold">{item.title}</h3>
                                        <p className="text-gray-400 text-sm">{item.type === 'movie' ? 'Movie' : 'TV Show'}</p>
                                        {item.releaseDate && (
                                            <p className="text-gray-500 text-xs">{new Date(item.releaseDate).getFullYear()}</p>
                                        )}
                                        {item.rating > 0 && (
                                            <p className="text-yellow-400 text-xs">⭐ {item.rating.toFixed(1)}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {showResults && searchResults.length === 0 && !loading && (
                    <div className="absolute top-full left-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-lg z-50 p-4 text-center text-gray-400">
                        No results found
                    </div>
                )}
            </div>
            <div className="flex items-center">
                <button className='flex rounded-xl bg-emerald-700 text-white justify-center items-center p-2 w-22 h-9 flex-column'>Sign Up</button>
            </div>
        </nav> 
    )
}