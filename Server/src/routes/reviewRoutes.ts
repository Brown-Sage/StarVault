import express from 'express';
import { createReview, getReviews, getMyReviews } from '../controllers/reviewController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/me', protect, getMyReviews);
router.get('/:mediaId', getReviews);

export default router;
