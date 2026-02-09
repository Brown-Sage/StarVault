import mongoose, { Schema, Document } from 'mongoose';

// Define Reply Interface
export interface IReply {
    _id?: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    comment: string;
    createdAt: Date;
}

export interface IReview extends Document {
    user: mongoose.Types.ObjectId;
    mediaId: string;
    mediaType: 'movie' | 'tv';
    mediaTitle: string;
    mediaPoster?: string;
    mediaReleaseDate?: string;
    rating: number;
    comment: string;
    replies: IReply[];
    createdAt: Date;
    updatedAt: Date;
}

const replySchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

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
    replies: [replySchema]
}, {
    timestamps: true,
});

reviewSchema.index({ user: 1, mediaId: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', reviewSchema);
