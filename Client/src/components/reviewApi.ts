import axios from 'axios';

export const getReviews = async (mediaId: string): Promise<any[]> => {
    try {
        const response = await axios.get(`http://localhost:3001/api/reviews/${mediaId}`);
        return response.data as any[];
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
};
