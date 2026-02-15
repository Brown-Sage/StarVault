import mongoose from 'mongoose';

const userMediaSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mediaId: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        enum: ['movie', 'tv'],
        required: true
    },
    mediaTitle: {
        type: String,
        required: true
    },
    mediaPoster: {
        type: String
    },
    mediaReleaseDate: {
        type: String
    },
    isWatched: {
        type: Boolean,
        default: false
    },
    isWatchlist: {
        type: Boolean,
        default: false
    },
    isFavorite: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Ensure a user can only have one entry per media item
userMediaSchema.index({ userId: 1, mediaId: 1 }, { unique: true });

const UserMedia = mongoose.model('UserMedia', userMediaSchema);

export default UserMedia;
