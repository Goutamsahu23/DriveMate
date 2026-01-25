import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import {
  requestRide,
  acceptRideRequest,
  verifyOTP,
  updateStatus,
  getMyRides,
  getRide,
  cancelRideRequest,
  getPendingRidesList
} from '../controllers/rideController.js';

const router = express.Router();

// Request a ride
router.post('/request', authenticate, [
  body('pickupLocation').notEmpty().withMessage('Pickup location is required'),
  body('dropoffLocation').notEmpty().withMessage('Dropoff location is required'),
  body('rideType').isIn(['economy', 'comfort', 'premium']).withMessage('Invalid ride type')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  await requestRide(req, res);
});

// Accept a ride
router.post('/:rideId/accept', authenticate, acceptRideRequest);

// Verify OTP and start ride
router.post('/:rideId/verify-otp', authenticate, verifyOTP);

// Update ride status
router.patch('/:rideId/status', authenticate, updateStatus);

// Get user's rides
router.get('/my-rides', authenticate, getMyRides);

// Get single ride
router.get('/:rideId', authenticate, getRide);

// Cancel ride
router.post('/:rideId/cancel', authenticate, cancelRideRequest);

// Get all pending rides
router.get('/pending/all', authenticate, getPendingRidesList);

export default router;
