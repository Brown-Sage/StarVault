import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// TMDB API configuration
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Types
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

// Routes
app.get('/api/trending', async (req, res) => {
  try {
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
      overview: item.overview,
      releaseDate: item.release_date || item.first_air_date
    }));

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
});

// Top Rated Movies
app.get('/api/top-rated/movies', async (req, res) => {
  try {
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
});

// Top Rated TV Shows
app.get('/api/top-rated/tv', async (req, res) => {
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
});

// Popular Movies
app.get('/api/popular/movies', async (req, res) => {
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
});

// Popular TV Shows
app.get('/api/popular/tv', async (req, res) => {
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
});

// Add a test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('TMDB API Key is set:', !!process.env.TMDB_API_KEY);
});