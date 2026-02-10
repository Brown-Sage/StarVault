import { Router } from 'express';
import {
    getTrending,
    getTopRatedMovies,
    getTopRatedTV,
    getPopularMovies,
    getPopularTV,
    getPopularAnime,
    getTopRatedAnime,
    getTrendingAnime,
    getMovieDetails,
    getTVDetails,
    getPersonDetails
} from '../controllers/mediaController';

const router = Router();

router.get('/trending', getTrending);
router.get('/top-rated/movies', getTopRatedMovies);
router.get('/top-rated/tv', getTopRatedTV);
router.get('/popular/movies', getPopularMovies);
router.get('/popular/tv', getPopularTV);
router.get('/anime/trending', getTrendingAnime);
router.get('/anime/popular', getPopularAnime);
router.get('/anime/top-rated', getTopRatedAnime);
router.get('/movie/:id', getMovieDetails);
router.get('/tv/:id', getTVDetails);
router.get('/person/:id', getPersonDetails);

export default router;

