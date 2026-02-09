import express from 'express';
import { createReview, getReviews, getMyReviews, getUserReviewForMedia, updateReview, addReply } from '../controllers/reviewController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/me', protect, getMyReviews);
router.get('/me/:mediaId', protect, getUserReviewForMedia);
router.put('/:reviewId', protect, updateReview);
router.post('/:reviewId/reply', protect, addReply);
router.get('/:mediaId', getReviews);

export default router;
