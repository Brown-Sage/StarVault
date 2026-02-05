import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    user: mongoose.Types.ObjectId;
    mediaId: string;
    mediaType: 'movie' | 'tv';
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

export default mongoose.model<IReview>('Review', reviewSchema);
