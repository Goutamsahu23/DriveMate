import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getMe,
  updateLocation,
  updateAvailability,
  getNearbyDriversList
} from '../controllers/userController.js';

const router = express.Router();

// Get current user
router.get('/me', authenticate, getMe);

// Update user location
router.patch('/location', authenticate, updateLocation);

// Update driver availability
router.patch('/availability', authenticate, updateAvailability);

// Get nearby drivers
router.get('/drivers/nearby', authenticate, getNearbyDriversList);

export default router;
