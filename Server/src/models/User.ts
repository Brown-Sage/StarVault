import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const sessionSchema = new mongoose.Schema({
    token: { type: String, required: true },
    device: { type: String, default: 'Unknown Device' },
    ip: { type: String, default: '' },
    lastActive: { type: Date, default: Date.now },
}, { _id: true });

const userSchema = new mongoose.Schema({
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

const User = mongoose.model('User', userSchema);

export default User;
