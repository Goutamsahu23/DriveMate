import { Server } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';

dotenv.config();

export const setupSocketIO = (app) => {
  const httpServer = createServer(app);
  
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST", "PATCH"]
    }
  });

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

  return { httpServer, io };
};

export default setupSocketIO;
