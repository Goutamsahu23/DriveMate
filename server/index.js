import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import rideRoutes from './routes/rides.js';
import userRoutes from './routes/users.js';

dotenv.config();

console.log('[Server] Environment loaded');
console.log('[Server] JWT_SECRET set:', !!process.env.JWT_SECRET);
console.log('[Server] MONGODB_URI set:', !!process.env.MONGODB_URI);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined room, socket.id: ${socket.id}`);
    } else {
      console.warn('join-room called without userId');
    }
  });

  socket.on('driver-location-update', (data) => {
    const { rideId, location } = data;
    io.to(rideId).emit('driver-location', { rideId, location });
  });

  socket.on('ride-status-update', (data) => {
    const { rideId, status } = data;
    io.to(rideId).emit('ride-status', { rideId, status });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/users', userRoutes);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/drivemate';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

export { io };
