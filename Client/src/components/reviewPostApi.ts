import axios from "axios";

export const createReview = async (
    mediaId: string,
    mediaType: string,
    rating: number,
    comment: string
) => {
    const token = localStorage.getItem("token");

    const res = await axios.post(
        "http://localhost:3001/api/reviews",
        { mediaId, mediaType, rating, comment },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return res.data;
};
