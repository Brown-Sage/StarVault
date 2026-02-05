import axios from 'axios';

export const getReviews = async (mediaId: string) => {
    try {
        const response = await axios.get(`http://localhost:3001/api/reviews/${mediaId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
};
