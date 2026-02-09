import axios from "axios";

export interface Review {
    _id: string;
    user: any;
    mediaId: string;
    mediaType: string;
    mediaTitle: string;
    mediaPoster: string;
    mediaReleaseDate: string;
    rating: number;
    comment: string;
    createdAt?: string;
    updatedAt?: string;
}

export const createReview = async (
    mediaId: string,
    mediaType: string,
    mediaTitle: string,
    mediaPoster: string,
    mediaReleaseDate: string,
    rating: number,
    comment: string
): Promise<Review> => {
    const token = localStorage.getItem("token");
    const API = import.meta.env.VITE_API_BASE_URL;

    const res = await axios.post<Review>(
        `${API}/api/reviews`,
        {
            mediaId,
            mediaType,
            mediaTitle,
            mediaPoster,
            mediaReleaseDate,
            rating,
            comment,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return res.data;
};

export const getUserReview = async (mediaId: string): Promise<Review | null> => {
    const token = localStorage.getItem("token");
    const API = import.meta.env.VITE_API_BASE_URL;

    try {
        const res = await axios.get<Review>(`${API}/api/reviews/me/${mediaId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (error) {
        // If 404/null, just return null, don't throw
        return null;
    }
};

export const updateReview = async (reviewId: string, rating: number, comment: string): Promise<Review> => {
    const token = localStorage.getItem("token");
    const API = import.meta.env.VITE_API_BASE_URL;

    const res = await axios.put<Review>(
        `${API}/api/reviews/${reviewId}`,
        { rating, comment },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return res.data;
};
