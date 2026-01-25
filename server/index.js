import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { setupSocketIO } from './config/socket.js';
import { PORT } from './config/constants.js';
import authRoutes from './routes/auth.js';
import rideRoutes from './routes/rides.js';
import userRoutes from './routes/users.js';

dotenv.config();

console.log('[Server] Environment loaded');
console.log('[Server] JWT_SECRET set:', !!process.env.JWT_SECRET);
console.log('[Server] MONGODB_URI set:', !!process.env.MONGODB_URI);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Socket.io
const { httpServer, io } = setupSocketIO(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB connection and server start
connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

export { io };
