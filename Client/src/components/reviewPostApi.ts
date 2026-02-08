import axios from "axios";

export const createReview = async (
    mediaId: string,
    mediaType: string,
    mediaTitle: string,
    mediaPoster: string,
    mediaReleaseDate: string,
    rating: number,
    comment: string
) => {
    const token = localStorage.getItem("token");
    const API = import.meta.env.VITE_API_BASE_URL;

    const res = await axios.post(
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
