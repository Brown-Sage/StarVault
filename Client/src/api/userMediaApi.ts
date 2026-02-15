import axios from 'axios';

interface UserMediaStatus {
    isWatched: boolean;
    isWatchlist: boolean;
    isFavorite: boolean;
}

interface ToggleResponse extends UserMediaStatus {
    message: string;
}

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/user-media`;

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Toggle status (watched, watchlist, favorite)
export const toggleUserMedia = async (data: {
    mediaId: string;
    mediaType: 'movie' | 'tv';
    mediaTitle: string;
    mediaPoster?: string;
    mediaReleaseDate?: string;
    action: 'toggleWatched' | 'toggleWatchlist' | 'toggleFavorite';
}): Promise<ToggleResponse> => {
    const response = await axios.post(`${API_URL}/toggle`, data, {
        headers: getAuthHeader()
    });
    return response.data as ToggleResponse;
};

// Get status for a specific media item
export const getUserMediaStatus = async (mediaId: string): Promise<UserMediaStatus> => {
    try {
        const response = await axios.get(`${API_URL}/status/${mediaId}`, {
            headers: getAuthHeader()
        });
        return response.data as UserMediaStatus;
    } catch (error) {
        // If error (e.g. 401 unauth), return default false status
        return { isWatched: false, isWatchlist: false, isFavorite: false };
    }
};

// Get list of items
export const getUserList = async (listType: 'watchlist' | 'watched' | 'favorites') => {
    const response = await axios.get(`${API_URL}/list/${listType}`, {
        headers: getAuthHeader()
    });
    return response.data as any[];
};
