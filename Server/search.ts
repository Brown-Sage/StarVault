import express, { Router } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// TMDB API configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// TMDB Response type
interface TMDBResponse {
  results: Array<{
    id: number;
    title?: string;
    name?: string;
    media_type?: string;
    vote_average: number;
    poster_path: string | null;
    overview: string;
    release_date?: string;
    first_air_date?: string;
  }>;
}

// Search endpoint
router.get('/search', async (req, res) => {
  try {
    const { query, page = '1' } = req.query;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        error: 'Search query is required',
        details: 'Please provide a valid search query'
      });
    }

    if (!process.env.TMDB_API_KEY) {
      throw new Error('TMDB API key is not set in environment variables');
    }

    console.log(`Searching TMDB for: "${query}"`);

    // Use TMDB multi-search endpoint to search both movies and TV shows
    const response = await axios.get<TMDBResponse>(`${TMDB_BASE_URL}/search/multi`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: 'en-US',
        query: query.trim(),
        page: parseInt(page as string) || 1
      }
    });

    console.log(`Found ${response.data.results.length} results for: "${query}"`);

    // Transform the data to match our frontend needs
    const searchResults = response.data.results
      .filter((item) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item) => ({
        id: item.id,
        title: item.title || item.name,
        type: item.media_type,
        rating: item.vote_average,
        imageUrl: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : null,
        overview: item.overview,
        releaseDate: item.release_date || item.first_air_date
      }));

    res.json(searchResults);
  } catch (error) {
    console.error('Error details:', error);
    if (axios.isAxiosError(error)) {
      console.error('TMDB API Error:', error.response?.data);
    }
    res.status(500).json({
      error: 'Failed to perform search',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;