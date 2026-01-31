import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || '';
        if (!mongoURI) {
            console.log('Mongo URI not found in env, skipping DB connection for now.');
            return;
        }
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
};

export default connectDB;
