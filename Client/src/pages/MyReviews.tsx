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
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center">
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-24 pb-12 px-4 md:px-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <span className="bg-purple-600 w-1.5 h-8 rounded-full"></span>
                    My Reviews
                </h1>

                {reviews.length === 0 ? (
                    <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-white/5">
                        <p className="text-gray-400 text-lg mb-6">You haven't written any reviews yet.</p>
                        <Link to="/" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold transition-all">
                            Browse Content
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 shadow-lg hover:shadow-purple-900/20 transition-all duration-300 group">
                                <Link to={`/${review.mediaType}/${review.mediaId}`} className="block relative aspect-video overflow-hidden">
                                    {review.mediaPoster ? (
                                        <img
                                            src={review.mediaPoster}
                                            alt={review.mediaTitle}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                            <span className="text-gray-500">No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                                        <h3 className="font-bold text-lg truncate text-white group-hover:text-purple-400 transition-colors">
                                            {review.mediaTitle}
                                        </h3>
                                        <div className="text-xs text-gray-300 flex items-center gap-2">
                                            <span className="uppercase tracking-wider font-semibold opacity-75">{review.mediaType}</span>
                                            {review.mediaReleaseDate && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                                                    <span>{new Date(review.mediaReleaseDate).getFullYear()}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>

                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-md border border-white/5">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="font-bold text-yellow-500">{review.rating}</span>
                                            <span className="text-gray-500 text-xs">/10</span>
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <p className="text-gray-300 text-sm italic line-clamp-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                        "{review.comment}"
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
