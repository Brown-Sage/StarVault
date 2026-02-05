import { Request, Response } from 'express';
import Review from '../models/Review';

export const createReview = async (req: Request, res: Response) => {
    try {
        const { mediaId, mediaType, rating, comment } = req.body;
        const userId = (req as any).userId;

        if (!mediaId || !mediaType || !rating || !comment) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const review = new Review({
            user: userId,
            mediaId,
            mediaType,
            rating,
            comment,
        });

        const savedReview = await review.save();
        return res.status(201).json(savedReview);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

export const getReviews = async (req: Request, res: Response) => {
    try {
        const { mediaId } = req.params;

        const reviews = await Review.find({ mediaId })
            .populate('user', 'email')
            .sort({ createdAt: -1 });

        return res.json(reviews);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};
