import { Request, Response } from 'express';
import Review from '../models/Review';

export const createReview = async (req: Request, res: Response) => {
    try {
        const { mediaId, mediaType, mediaTitle, mediaPoster, mediaReleaseDate, rating, comment } = req.body;
        const userId = req.user;

        if (!mediaId || !mediaType || !mediaTitle || !rating || !comment) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const review = new Review({
            user: userId,
            mediaId,
            mediaType,
            mediaTitle,
            mediaPoster,
            mediaReleaseDate,
            rating,
            comment,
        });

        const savedReview = await review.save();
        return res.status(201).json(savedReview);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

export const getMyReviews = async (req: Request, res: Response) => {
    try {
        const userId = req.user;
        const reviews = await Review.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('user', 'email');
        return res.json(reviews);
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

export const getUserReviewForMedia = async (req: Request, res: Response) => {
    try {
        const userId = req.user;
        const { mediaId } = req.params;

        const review = await Review.findOne({ user: userId, mediaId });
        return res.json(review);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

export const updateReview = async (req: Request, res: Response) => {
    try {
        const userId = req.user;
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findOneAndUpdate(
            { _id: reviewId, user: userId },
            { rating, comment },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }

        return res.json(review);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};
