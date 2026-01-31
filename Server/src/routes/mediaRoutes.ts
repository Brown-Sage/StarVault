import { Router } from 'express';
import {
    getTrending,
    getTopRatedMovies,
    getTopRatedTV,
    getPopularMovies,
    getPopularTV,
    getMovieDetails,
    getTVDetails
} from '../controllers/mediaController';

const router = Router();

router.get('/trending', getTrending);
router.get('/top-rated/movies', getTopRatedMovies);
router.get('/top-rated/tv', getTopRatedTV);
router.get('/popular/movies', getPopularMovies);
router.get('/popular/tv', getPopularTV);
router.get('/movie/:id', getMovieDetails);
router.get('/tv/:id', getTVDetails);

export default router;
