import express from 'express';
import { toggleUserMedia, getUserMediaStatus, getUserList } from '../controllers/userMediaController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.post('/toggle', toggleUserMedia);
router.get('/status/:mediaId', getUserMediaStatus);
router.get('/list/:listType', getUserList);

export default router;
