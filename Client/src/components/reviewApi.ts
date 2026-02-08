import axios from 'axios';

export const getReviews = async (mediaId: string): Promise<any[]> => {
    try {
        const API = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.get(`${API}/api/reviews/${mediaId}`);
        return response.data as any[];
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
};
