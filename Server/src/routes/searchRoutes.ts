import { Router } from 'express';
import { searchMedia, searchVibe, chatbot } from '../controllers/searchController';

const router = Router();

router.get('/search', searchMedia);
router.post('/search/vibe', searchVibe);
router.post('/chat', chatbot);

export default router;

