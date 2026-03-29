import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Clock, Heart, Bookmark, Film } from 'lucide-react';
import { getUserList } from '../api/userMediaApi';

interface Review {
    _id: string;
    mediaId: string;
    mediaType: string;
    mediaTitle: string;
    mediaPoster?: string;
    mediaReleaseDate?: string;
    rating: number;
    comment: string;
    createdAt: string;
}

interface UserMediaItem {
    _id: string;
    mediaId: string;
    mediaType: 'movie' | 'tv';
    mediaTitle: string;
    mediaPoster?: string;
    mediaReleaseDate?: string;
    isWatched: boolean;
    isWatchlist: boolean;
    isFavorite: boolean;
    createdAt: string;
    updatedAt: string;
}

type TabType = 'reviews' | 'watchlist' | 'favorites' | 'watched';

export default function MyReviews() {
    const [activeTab, setActiveTab] = useState<TabType>('reviews');

    // Data states
    const [reviews, setReviews] = useState<Review[]>([]);
    const [watchlist, setWatchlist] = useState<UserMediaItem[]>([]);
    const [favorites, setFavorites] = useState<UserMediaItem[]>([]);
    const [watched, setWatched] = useState<UserMediaItem[]>([]);

    // Loading states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem("token");

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                // Determine what to fetch based on active tab
                if (activeTab === 'reviews') {
                    if (reviews.length === 0) {
                        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/me`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setReviews(response.data as Review[]);
                    }
                } else if (activeTab === 'watchlist') {
                    if (watchlist.length === 0) {
                        const data = await getUserList('watchlist');
                        setWatchlist(data);
                    }
                } else if (activeTab === 'favorites') {
                    if (favorites.length === 0) {
                        const data = await getUserList('favorites');
                        setFavorites(data);
                    }
                } else if (activeTab === 'watched') {
                    if (watched.length === 0) {
                        const data = await getUserList('watched');
                        setWatched(data);
                    }
                }
            } catch (err) {
                console.error(`Error fetching ${activeTab}:`, err);
                setError(`Failed to load your ${activeTab}.`);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [activeTab, navigate, reviews.length, watchlist.length, favorites.length, watched.length]); // Dependencies ensure we only fetch if empty or tab changes

    const TabButton = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeTab === id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 transform scale-105'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    const renderReviews = () => {
        if (reviews.length === 0) return renderEmptyState('You haven\'t written any reviews yet.');

        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {reviews.map((review) => (
                    <div key={review._id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 shadow-xl hover:shadow-indigo-900/20 hover:border-indigo-500/30 transition-all duration-300 group flex flex-col h-full">
                        <Link to={`/${review.mediaType}/${review.mediaId}`} className="block relative aspect-video overflow-hidden">
                            {review.mediaPoster ? (
                                <img
                                    src={review.mediaPoster}
                                    alt={review.mediaTitle}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                    <span className="text-gray-600 font-medium">No Image</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
                                <h3 className="font-bold text-lg truncate text-white group-hover:text-indigo-400 transition-colors drop-shadow-md">
                                    {review.mediaTitle}
                                </h3>
                                <div className="text-xs text-gray-300 flex items-center gap-2 mt-1">
                                    <span className="uppercase tracking-wider font-semibold opacity-75 text-indigo-300">{review.mediaType}</span>
                                    {review.mediaReleaseDate && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                                            <span>{new Date(review.mediaReleaseDate).getFullYear()}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Link>

                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-md border border-white/5">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                                    <span className="font-bold text-yellow-400">{review.rating}</span>
                                    <span className="text-gray-500 text-xs font-medium self-end mb-0.5">/10</span>
                                </div>
                                <span className="text-xs text-gray-400 font-medium">
                                    {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                            </div>

                            <div className="relative mb-2 flex-grow">
                                <div className="absolute -left-2 -top-2 text-4xl text-white/5 font-serif">"</div>
                                <p className="text-gray-300 text-sm italic line-clamp-4 relative z-10 px-2 leading-relaxed">
                                    {review.comment}
                                </p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                                <Link to={`/${review.mediaType}/${review.mediaId}`} className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                                    View Details &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderMediaList = (items: UserMediaItem[], emptyMessage: string) => {
        if (items.length === 0) return renderEmptyState(emptyMessage);

        return (
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((item) => (
                    <Link key={item._id} to={`/${item.mediaType}/${item.mediaId}`} className="group bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 shadow-lg hover:shadow-indigo-900/20 hover:border-indigo-500/30 transition-all duration-300 flex flex-col h-full">
                        <div className="relative aspect-[2/3] overflow-hidden">
                            {item.mediaPoster ? (
                                <img
                                    src={item.mediaPoster}
                                    alt={item.mediaTitle}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                    <Film className="w-12 h-12 text-gray-700" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                <span className="text-indigo-400 font-medium text-sm flex items-center gap-1">
                                    View Details <div className="w-4 h-4 rounded-full border border-indigo-400 flex items-center justify-center text-[10px] ml-1">&rarr;</div>
                                </span>
                            </div>

                            {/* Badges */}
                            <div className="absolute top-2 right-2 flex flex-col gap-2">
                                {item.isFavorite && (
                                    <div className="bg-red-500/90 p-1.5 rounded-full backdrop-blur-md shadow-lg" title="Favorite">
                                        <Heart className="w-3 h-3 text-white fill-white" />
                                    </div>
                                )}
                                {item.isWatchlist && (
                                    <div className="bg-blue-500/90 p-1.5 rounded-full backdrop-blur-md shadow-lg" title="Watchlist">
                                        <Bookmark className="w-3 h-3 text-white fill-white" />
                                    </div>
                                )}
                                {item.isWatched && (
                                    <div className="bg-indigo-500/90 p-1.5 rounded-full backdrop-blur-md shadow-lg" title="Watched">
                                        <Clock className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 mb-1" title={item.mediaTitle}>
                                {item.mediaTitle}
                            </h3>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-xs text-indigo-400/80 uppercase font-bold tracking-wider">{item.mediaType}</span>
                                {item.mediaReleaseDate && (
                                    <span className="text-xs text-gray-500">{new Date(item.mediaReleaseDate).getFullYear()}</span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        );
    };

    const renderEmptyState = (message: string) => (
        <div className="text-center py-20 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-white/5 flex flex-col items-center">
            <div className="bg-gray-800/50 p-4 rounded-full mb-4">
                <Film className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 text-lg mb-6">{message}</p>
            <Link to="/" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-indigo-900/40 transform hover:scale-105 active:scale-95 duration-200">
                Browse Content
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white pt-24 pb-12 px-4 md:px-8">
            <div className="container mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                        <span className="bg-indigo-600 w-1.5 h-8 rounded-full shadow-[0_0_10px_rgba(5,150,105,0.6)]"></span>
                        My Library
                    </h1>

                    <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        <TabButton id="reviews" label="Reviews" icon={Star} />
                        <TabButton id="watchlist" label="Watchlist" icon={Bookmark} />
                        <TabButton id="favorites" label="Favorites" icon={Heart} />
                        <TabButton id="watched" label="Watched" icon={Clock} />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-400 text-xl bg-red-900/20 px-6 py-4 rounded-xl border border-red-500/30 backdrop-blur-sm text-center">
                        {error}
                    </div>
                ) : (
                    <>
                        {activeTab === 'reviews' && renderReviews()}
                        {activeTab === 'watchlist' && renderMediaList(watchlist, "Your watchlist is empty.")}
                        {activeTab === 'favorites' && renderMediaList(favorites, "You haven't added any favorites yet.")}
                        {activeTab === 'watched' && renderMediaList(watched, "You haven't marked any content as watched yet.")}
                    </>
                )}
            </div>
        </div>
    );
}
