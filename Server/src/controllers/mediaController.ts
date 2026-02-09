import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// TMDB API configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

// Cache configuration
interface CacheItem {
    data: any;
    timestamp: number;
}

const cache: { [key: string]: CacheItem } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes 

function getCachedData(key: string) {
    const item = cache[key];
    if (item && Date.now() - item.timestamp < CACHE_DURATION) {
        return item.data;
    }
    return null;
}

function setCachedData(key: string, data: any) {
    cache[key] = {
        data,
        timestamp: Date.now()
    };
}

// Types
interface TMDBResponse {
    results: Array<{
        id: number;
        title?: string;
        name?: string;
        media_type?: string;
        vote_average: number;
        poster_path: string | null;
        backdrop_path: string | null;
        overview: string;
        release_date?: string;
        first_air_date?: string;
    }>;
}

// Helper function to format TMDB response
function formatTMDBResponse(details: any, type: 'movie' | 'tv') {
    return {
        id: details.id,
        title: type === 'movie' ? details.title : details.name,
        type,
        rating: details.vote_average,
        imageUrl: details.poster_path ? `${TMDB_IMAGE_BASE_URL}${details.poster_path}` : null,
        backdropUrl: details.backdrop_path ? `${TMDB_BACKDROP_BASE_URL}${details.backdrop_path}` : null,
        overview: details.overview,
        releaseDate: type === 'movie' ? details.release_date : details.first_air_date,
        genres: details.genres?.map((genre: { name: string }) => genre.name),
        runtime: type === 'movie' ? details.runtime : details.episode_run_time?.[0],
        status: details.status,
        tagline: details.tagline,
        ...(type === 'movie' ? {
            budget: details.budget,
            revenue: details.revenue
        } : {
            numberOfSeasons: details.number_of_seasons,
            numberOfEpisodes: details.number_of_episodes
        })
    };
}

export const getTrending = async (req: Request, res: Response) => {
    try {
        const cacheKey = 'trending';
        const cachedData = getCachedData(cacheKey);

        if (cachedData) {
            console.log('Serving trending data from cache');
            return res.json(cachedData);
        }

        if (!process.env.TMDB_API_KEY) {
            throw new Error('TMDB API key is not set in environment variables');
        }

        console.log('Fetching trending data from TMDB...');
        const response = await axios.get<TMDBResponse>(`${TMDB_BASE_URL}/trending/all/week`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US'
            }
        });

        console.log('Successfully fetched data from TMDB');

        // Transform the data to match our frontend needs
        const trendingItems = response.data.results.map((item) => ({
            id: item.id,
            title: item.title || item.name,
            type: item.media_type,
            rating: item.vote_average,
            imageUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : null,
            backdropUrl: item.backdrop_path ? `${TMDB_BACKDROP_BASE_URL}${item.backdrop_path}` : null,
            overview: item.overview,
            releaseDate: item.release_date || item.first_air_date
        }));

        setCachedData(cacheKey, trendingItems);
        res.json(trendingItems);
    } catch (error) {
        console.error('Error details:', error);
        if (axios.isAxiosError(error)) {
            console.error('TMDB API Error:', error.response?.data);
        }
        res.status(500).json({
            error: 'Failed to fetch trending data',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getTopRatedMovies = async (req: Request, res: Response) => {
    try {
        const cacheKey = 'top-rated-movies';
        const cachedData = getCachedData(cacheKey);

        if (cachedData) {
            console.log('Serving top-rated movies from cache');
            return res.json(cachedData);
        }

        if (!process.env.TMDB_API_KEY) {
            throw new Error('TMDB API key is not set in environment variables');
        }

        console.log('Fetching top-rated movies from TMDB...');
        const response = await axios.get<TMDBResponse>(`${TMDB_BASE_URL}/movie/top_rated`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                page: req.query.page || 1
            }
        });

        console.log('Successfully fetched top-rated movies from TMDB');

        const topRatedMovies = response.data.results.map((item) => ({
            id: item.id,
            title: item.title,
            type: 'movie',
            rating: item.vote_average,
            imageUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : null,
            overview: item.overview,
            releaseDate: item.release_date
        }));

        setCachedData(cacheKey, topRatedMovies);
        res.json(topRatedMovies);
    } catch (error) {
        console.error('Error details:', error);
        if (axios.isAxiosError(error)) {
            console.error('TMDB API Error:', error.response?.data);
        }
        res.status(500).json({
            error: 'Failed to fetch top-rated movies',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getTopRatedTV = async (req: Request, res: Response) => {
    try {
        if (!process.env.TMDB_API_KEY) {
            throw new Error('TMDB API key is not set in environment variables');
        }

        console.log('Fetching top-rated TV shows from TMDB...');
        const response = await axios.get<TMDBResponse>(`${TMDB_BASE_URL}/tv/top_rated`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                page: req.query.page || 1
            }
        });

        console.log('Successfully fetched top-rated TV shows from TMDB');

        const topRatedTVShows = response.data.results.map((item) => ({
            id: item.id,
            title: item.name,
            type: 'tv',
            rating: item.vote_average,
            imageUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : null,
            overview: item.overview,
            releaseDate: item.first_air_date
        }));

        res.json(topRatedTVShows);
    } catch (error) {
        console.error('Error details:', error);
        if (axios.isAxiosError(error)) {
            console.error('TMDB API Error:', error.response?.data);
        }
        res.status(500).json({
            error: 'Failed to fetch top-rated TV shows',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getPopularMovies = async (req: Request, res: Response) => {
    try {
        if (!process.env.TMDB_API_KEY) {
            throw new Error('TMDB API key is not set in environment variables');
        }

        console.log('Fetching popular movies from TMDB...');
        const response = await axios.get<TMDBResponse>(`${TMDB_BASE_URL}/movie/popular`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                page: req.query.page || 1
            }
        });

        const popularMovies = response.data.results.map((item) => ({
            id: item.id,
            title: item.title,
            type: 'movie',
            rating: item.vote_average,
            imageUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : null,
            overview: item.overview,
            releaseDate: item.release_date
        }));

        res.json(popularMovies);
    } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({
            error: 'Failed to fetch popular movies',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getPopularTV = async (req: Request, res: Response) => {
    try {
        if (!process.env.TMDB_API_KEY) {
            throw new Error('TMDB API key is not set in environment variables');
        }

        console.log('Fetching popular TV shows from TMDB...');
        const response = await axios.get<TMDBResponse>(`${TMDB_BASE_URL}/tv/popular`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                page: req.query.page || 1
            }
        });

        const popularTVShows = response.data.results.map((item) => ({
            id: item.id,
            title: item.name,
            type: 'tv',
            rating: item.vote_average,
            imageUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : null,
            overview: item.overview,
            releaseDate: item.first_air_date
        }));

        res.json(popularTVShows);
    } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({
            error: 'Failed to fetch popular TV shows',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getPopularAnime = async (req: Request, res: Response) => {
    try {
        if (!process.env.TMDB_API_KEY) {
            throw new Error('TMDB API key is not set in environment variables');
        }

        console.log('Fetching popular anime from TMDB...');
        const response = await axios.get<TMDBResponse>(`${TMDB_BASE_URL}/discover/tv`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                with_genres: '16',
                with_origin_country: 'JP',
                sort_by: 'popularity.desc',
                page: req.query.page || 1
            }
        });

        const popularAnime = response.data.results.map((item) => ({
            id: item.id,
            title: item.name,
            type: 'tv',
            rating: item.vote_average,
            imageUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : null,
            overview: item.overview,
            releaseDate: item.first_air_date
        }));

        res.json(popularAnime);
    } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({
            error: 'Failed to fetch popular anime',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getTopRatedAnime = async (req: Request, res: Response) => {
    try {
        if (!process.env.TMDB_API_KEY) {
            throw new Error('TMDB API key is not set in environment variables');
        }

        console.log('Fetching top-rated anime from TMDB...');
        const response = await axios.get<TMDBResponse>(`${TMDB_BASE_URL}/discover/tv`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                with_genres: '16',
                with_origin_country: 'JP',
                sort_by: 'vote_average.desc',
                'vote_count.gte': 200,
                page: req.query.page || 1
            }
        });

        const topRatedAnime = response.data.results.map((item) => ({
            id: item.id,
            title: item.name,
            type: 'tv',
            rating: item.vote_average,
            imageUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : null,
            overview: item.overview,
            releaseDate: item.first_air_date
        }));

        res.json(topRatedAnime);
    } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({
            error: 'Failed to fetch top-rated anime',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getTrendingAnime = async (req: Request, res: Response) => {
    try {
        if (!process.env.TMDB_API_KEY) {
            throw new Error('TMDB API key is not set in environment variables');
        }

        console.log('Fetching trending anime from TMDB...');
        const response = await axios.get<TMDBResponse>(`${TMDB_BASE_URL}/discover/tv`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'en-US',
                with_genres: '16',
                with_origin_country: 'JP',
                sort_by: 'popularity.desc',
                'vote_count.gte': 50,
                page: req.query.page || 1
            }
        });

        const trendingAnime = response.data.results.map((item) => ({
            id: item.id,
            title: item.name,
            type: 'tv',
            rating: item.vote_average,
            imageUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : null,
            backdropUrl: item.backdrop_path ? `${TMDB_BACKDROP_BASE_URL}${item.backdrop_path}` : null,
            overview: item.overview,
            releaseDate: item.first_air_date
        }));

        res.json(trendingAnime);
    } catch (error) {
        console.error('Error details:', error);
        res.status(500).json({
            error: 'Failed to fetch trending anime',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getMovieDetails = async (req: Request, res: Response) => {
    try {
        if (!process.env.TMDB_API_KEY) {
            throw new Error('TMDB API key is not set in environment variables');
        }

        const { id } = req.params;
        // Fetch movie details, credits, and videos
        const [detailsRes, creditsRes, videosRes] = await Promise.all([
            axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    language: 'en-US'
                }
            }),
            axios.get(`${TMDB_BASE_URL}/movie/${id}/credits`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    language: 'en-US'
                }
            }),
            axios.get(`${TMDB_BASE_URL}/movie/${id}/videos`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    language: 'en-US'
                }
            })
        ]);

        const details = formatTMDBResponse(detailsRes.data, 'movie');
        const cast = creditsRes.data.cast.slice(0, 10).map((member: any) => ({
            id: member.id,
            name: member.name,
            character: member.character,
            profileUrl: member.profile_path ? `${TMDB_IMAGE_BASE_URL}${member.profile_path}` : null
        }));
        // Crew extraction
        const directors = creditsRes.data.crew.filter((c: any) => c.job === 'Director').map((c: any) => c.name);
        const writers = creditsRes.data.crew.filter((c: any) => c.job === 'Writer' || c.job === 'Screenplay' || c.job === 'Story').map((c: any) => c.name);
        // Trailer extraction (YouTube only)
        const trailer = videosRes.data.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
        const trailerKey = trailer ? trailer.key : null;
        res.json({ ...details, cast, crew: { directors, writers }, trailerKey });
    } catch (error) {
        console.error('Error fetching movie details:', error);
        res.status(500).json({
            error: 'Failed to fetch movie details',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getTVDetails = async (req: Request, res: Response) => {
    try {
        if (!process.env.TMDB_API_KEY) {
            throw new Error('TMDB API key is not set in environment variables');
        }

        const { id } = req.params;
        // Fetch TV show details, credits, and videos
        const [detailsRes, creditsRes, videosRes] = await Promise.all([
            axios.get(`${TMDB_BASE_URL}/tv/${id}`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    language: 'en-US'
                }
            }),
            axios.get(`${TMDB_BASE_URL}/tv/${id}/credits`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    language: 'en-US'
                }
            }),
            axios.get(`${TMDB_BASE_URL}/tv/${id}/videos`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    language: 'en-US'
                }
            })
        ]);

        const details = formatTMDBResponse(detailsRes.data, 'tv');
        const cast = creditsRes.data.cast.slice(0, 10).map((member: any) => ({
            id: member.id,
            name: member.name,
            character: member.character,
            profileUrl: member.profile_path ? `${TMDB_IMAGE_BASE_URL}${member.profile_path}` : null
        }));
        // Crew extraction
        const directors = creditsRes.data.crew.filter((c: any) => c.job === 'Director').map((c: any) => c.name);
        const writers = creditsRes.data.crew.filter((c: any) => c.job === 'Writer' || c.job === 'Screenplay' || c.job === 'Story').map((c: any) => c.name);
        // Trailer extraction (YouTube only)
        const trailer = videosRes.data.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
        const trailerKey = trailer ? trailer.key : null;
        res.json({ ...details, cast, crew: { directors, writers }, trailerKey });
    } catch (error) {
        console.error('Error fetching TV show details:', error);
        res.status(500).json({
            error: 'Failed to fetch TV show details',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
