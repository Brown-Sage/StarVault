import { Router } from 'express';
import { searchMedia, searchVibe } from '../controllers/searchController';

const router = Router();

router.get('/search', searchMedia);
router.post('/search/vibe', searchVibe);

export default router;
