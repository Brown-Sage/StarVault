import app from './app';
import connectDB from './config/db';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const port = process.env.PORT || 3001;

// Connect to Database (Optional/Future use)
connectDB();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('TMDB API Key is set:', !!process.env.TMDB_API_KEY);
});
