import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUserPreferences {
    favoriteArtists: string[];
    favoriteMovieTypes: string[];
    favoriteFormats: string[];
    favoriteMoods: string[];
}

export interface IUser extends Document {
    email: string;
    password: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    accentColor: string;
    onboardingCompleted: boolean;
    preferences: IUserPreferences;
    sessions: Array<{
        _id: mongoose.Types.ObjectId;
        token: string;
        device: string;
        ip: string;
        lastActive: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const sessionSchema = new mongoose.Schema({
    token: { type: String, required: true },
    device: { type: String, default: 'Unknown Device' },
    ip: { type: String, default: '' },
    lastActive: { type: Date, default: Date.now },
}, { _id: true });

const userSchema = new mongoose.Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        default: '',
        trim: true,
        maxlength: 50,
    },
    bio: {
        type: String,
        default: '',
        trim: true,
        maxlength: 300,
    },
    avatarUrl: {
        type: String,
        default: '',
        trim: true,
    },
    accentColor: {
        type: String,
        default: 'indigo',
        enum: ['indigo', 'violet', 'emerald', 'rose', 'amber'],
    },
    onboardingCompleted: {
        type: Boolean,
        default: false,
    },
    preferences: {
        favoriteArtists: { type: [String], default: [] },
        favoriteMovieTypes: { type: [String], default: [] },
        favoriteFormats: { type: [String], default: [] },
        favoriteMoods: { type: [String], default: [] },
    },
    sessions: {
        type: [sessionSchema],
        default: [],
    },
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        throw err;
    }
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;

