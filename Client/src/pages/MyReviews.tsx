import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Star } from 'lucide-react';

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

export default function MyReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyReviews = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setReviews(response.data as Review[]);
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setError("Failed to load your reviews.");
            } finally {
                setLoading(false);
            }
        };

        fetchMyReviews();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#081a0b] flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#081a0b] flex justify-center items-center">
                <div className="text-red-400 text-xl bg-red-900/20 px-6 py-4 rounded-xl border border-red-500/30 backdrop-blur-sm">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#081a0b] via-[#0e1f10] to-[#081a0b] text-white pt-24 pb-12 px-4 md:px-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <span className="bg-emerald-600 w-1.5 h-8 rounded-full shadow-[0_0_10px_rgba(5,150,105,0.6)]"></span>
                    My Reviews
                </h1>

                {reviews.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-white/5">
                        <p className="text-gray-400 text-lg mb-6">You haven't written any reviews yet.</p>
                        <Link to="/" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-emerald-900/40 transform hover:scale-105 active:scale-95 duration-200">
                            Browse Content
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 shadow-xl hover:shadow-emerald-900/20 hover:border-emerald-500/30 transition-all duration-300 group flex flex-col h-full">
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
                                        <h3 className="font-bold text-lg truncate text-white group-hover:text-emerald-400 transition-colors drop-shadow-md">
                                            {review.mediaTitle}
                                        </h3>
                                        <div className="text-xs text-gray-300 flex items-center gap-2 mt-1">
                                            <span className="uppercase tracking-wider font-semibold opacity-75 text-emerald-300">{review.mediaType}</span>
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
                                        <Link to={`/${review.mediaType}/${review.mediaId}`} className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                                            View Details &rarr;
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
