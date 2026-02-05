import express from 'express';
import cors from 'cors';
import mediaRoutes from './routes/mediaRoutes';
import searchRoutes from './routes/searchRoutes';
import authRoutes from './routes/authRoutes';
import { protect } from "./middleware/authMiddleware";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', mediaRoutes);
app.use('/api', searchRoutes);
app.use('/api/auth', authRoutes);

// Helper route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

app.get("/api/protected", protect, (req, res) => {
    res.json({
        message: "You are authorized",
        userId: (req as any).userId,
    });
});


export default app;
