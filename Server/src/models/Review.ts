import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    user: mongoose.Types.ObjectId;
    mediaId: string;
    mediaType: 'movie' | 'tv';
    mediaTitle: string;
    mediaPoster?: string;
    mediaReleaseDate?: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema: Schema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    mediaId: {
        type: String,
        required: true,
    },
    mediaType: {
        type: String,
        enum: ['movie', 'tv'],
        required: true,
    },
    mediaTitle: {
        type: String,
        required: true,
    },
    mediaPoster: {
        type: String,
        required: false,
    },
    mediaReleaseDate: {
        type: String,
        required: false,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
    },
    comment: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

reviewSchema.index({ user: 1, mediaId: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', reviewSchema);
