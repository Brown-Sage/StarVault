import { Router } from 'express';
import { searchMedia } from '../controllers/searchController';

const router = Router();

router.get('/search', searchMedia);

export default router;
