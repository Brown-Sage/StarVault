import { Request, Response } from 'express';
import UserMedia from '../models/UserMedia';

// Toggle status of a media item (watched, watchlist, favorite)
export const toggleUserMedia = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user;
        const { mediaId, mediaType, mediaTitle, mediaPoster, mediaReleaseDate, action } = req.body;

        if (!mediaId || !mediaType || !action) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let userMedia = await UserMedia.findOne({ userId, mediaId });

        if (!userMedia) {
            // Create new entry
            userMedia = new UserMedia({
                userId,
                mediaId,
                mediaType,
                mediaTitle,
                mediaPoster,
                mediaReleaseDate
            });
        }

        // Apply action
        switch (action) {
            case 'toggleWatched':
                userMedia.isWatched = !userMedia.isWatched;
                if (userMedia.isWatched) {
                    userMedia.isWatchlist = false;
                }
                break;
            case 'toggleWatchlist':
                userMedia.isWatchlist = !userMedia.isWatchlist;
                if (userMedia.isWatchlist) {
                    userMedia.isWatched = false;
                }
                break;
            case 'toggleFavorite':
                userMedia.isFavorite = !userMedia.isFavorite;
                break;
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }

        // If all flags are false, we could delete the document, but keeping it is fine for history.
        // Actually, deleting empty documents keeps DB clean.
        if (!userMedia.isWatched && !userMedia.isWatchlist && !userMedia.isFavorite) {
            await UserMedia.deleteOne({ _id: userMedia._id });
            return res.status(200).json({
                isWatched: false,
                isWatchlist: false,
                isFavorite: false,
                message: 'Media removed from user lists'
            });
        }

        await userMedia.save();

        res.status(200).json({
            isWatched: userMedia.isWatched,
            isWatchlist: userMedia.isWatchlist,
            isFavorite: userMedia.isFavorite,
            message: 'User media updated'
        });

    } catch (error) {
        console.error('Error toggling user media:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get status for a specific media item
export const getUserMediaStatus = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user;
        const { mediaId } = req.params;

        const userMedia = await UserMedia.findOne({ userId, mediaId });

        if (!userMedia) {
            return res.status(200).json({
                isWatched: false,
                isWatchlist: false,
                isFavorite: false
            });
        }

        res.status(200).json({
            isWatched: userMedia.isWatched,
            isWatchlist: userMedia.isWatchlist,
            isFavorite: userMedia.isFavorite
        });

    } catch (error) {
        console.error('Error getting user media status:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all items in a specific list (watchlist, watched, favorites)
export const getUserList = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user;
        const { listType } = req.params; // 'watchlist', 'watched', 'favorites'

        let query: any = { userId };

        switch (listType) {
            case 'watchlist':
                query.isWatchlist = true;
                break;
            case 'watched':
                query.isWatched = true;
                break;
            case 'favorites':
                query.isFavorite = true;
                break;
            default:
                return res.status(400).json({ error: 'Invalid list type' });
        }

        const items = await UserMedia.find(query).sort({ updatedAt: -1 });

        res.status(200).json(items);

    } catch (error) {
        console.error('Error fetching user list:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
