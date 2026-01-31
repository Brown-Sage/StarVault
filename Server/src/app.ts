import express from 'express';
import cors from 'cors';
import mediaRoutes from './routes/mediaRoutes';
import searchRoutes from './routes/searchRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', mediaRoutes);
app.use('/api', searchRoutes);

// Helper route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

export default app;
