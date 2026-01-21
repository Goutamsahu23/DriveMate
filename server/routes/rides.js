import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import Ride from '../models/Ride.js';
import User from '../models/User.js';

const router = express.Router();

// Calculate fare (simple calculation)
const calculateFare = (distance, rideType) => {
  const baseFare = 2.5;
  const perKmRate = {
    economy: 1.5,
    comfort: 2.0,
    premium: 3.0
  };
  return baseFare + (distance * perKmRate[rideType] || perKmRate.economy);
};

// Calculate distance (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Request a ride
router.post('/request', authenticate, [
  body('pickupLocation').notEmpty().withMessage('Pickup location is required'),
  body('dropoffLocation').notEmpty().withMessage('Dropoff location is required'),
  body('rideType').isIn(['economy', 'comfort', 'premium']).withMessage('Invalid ride type')
], async (req, res) => {
  try {
    if (req.user.role !== 'rider') {
      return res.status(403).json({ message: 'Only riders can request rides' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pickupLocation, dropoffLocation, rideType } = req.body;

    // Calculate distance and fare
    const distance = calculateDistance(
      pickupLocation.lat,
      pickupLocation.lng,
      dropoffLocation.lat,
      dropoffLocation.lng
    );
    const fare = calculateFare(distance, rideType);

    // Create ride
    const ride = new Ride({
      rider: req.user._id,
      pickupLocation,
      dropoffLocation,
      rideType,
      distance,
      fare
    });

    await ride.save();

    // Broadcast to ALL online drivers (not just nearby)
    // All drivers can see all pending rides and pick any of them
    const io = req.app.get('io');
    if (io) {
      console.log('Broadcasting new pending ride to all drivers:', ride._id);
      // Broadcast to all drivers via "pending-rides" room
      io.emit('pending-ride-available', {
        _id: ride._id,
        rideId: ride._id,
        pickupLocation,
        dropoffLocation,
        fare,
        distance,
        rideType,
        rider: {
          name: req.user.name,
          phone: req.user.phone
        },
        createdAt: ride.createdAt
      });
      console.log('Pending ride broadcast complete');
    } else {
      console.warn('Socket.io not available');
    }

    res.status(201).json(ride);
  } catch (error) {
    console.error('Request ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept a ride (driver)
router.post('/:rideId/accept', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can accept rides' });
    }

    if (!req.user.isAvailable) {
      return res.status(400).json({ message: 'Driver is not available' });
    }

    const ride = await Ride.findById(req.params.rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({ message: 'Ride is not available' });
    }

    ride.driver = req.user._id;
    ride.status = 'accepted';
    ride.acceptedAt = new Date();
    await ride.save();

    // Update driver availability
    req.user.isAvailable = false;
    await req.user.save();

    // Notify rider
    const io = req.app.get('io');
    if (io) {
      io.to(ride.rider.toString()).emit('ride-accepted', {
        rideId: ride._id,
        driver: {
          id: req.user._id,
          name: req.user.name,
          phone: req.user.phone,
          vehicleInfo: req.user.vehicleInfo,
          rating: req.user.rating,
          currentLocation: req.user.currentLocation
        }
      });
    }

    res.json(ride);
  } catch (error) {
    console.error('Accept ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP and start ride (called by driver)
router.post('/:rideId/verify-otp', authenticate, async (req, res) => {
  try {
    const { otp } = req.body;
    const ride = await Ride.findById(req.params.rideId).populate('driver rider');

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user is the driver
    if (req.user._id.toString() !== ride.driver._id.toString()) {
      return res.status(403).json({ message: 'Only the driver can verify OTP' });
    }

    // Check if OTP exists and is not expired
    if (!ride.otp || !ride.otp.code) {
      return res.status(400).json({ message: 'OTP not generated. Driver must arrive first.' });
    }

    if (new Date() > ride.otp.expiresAt) {
      return res.status(400).json({ message: 'OTP has expired. Request a new one.' });
    }

    // Check if OTP matches
    if (otp !== ride.otp.code) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark OTP as verified and update ride status
    ride.otp.verified = true;
    ride.status = 'in_progress';
    ride.startedAt = new Date();
    await ride.save();

    // Notify both parties via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(ride.rider._id.toString()).emit('ride-status-update', { 
        rideId: ride._id, 
        status: 'in_progress',
        ride: ride 
      });
      io.to(ride.driver._id.toString()).emit('ride-status-update', { 
        rideId: ride._id, 
        status: 'in_progress',
        ride: ride 
      });
    }

    console.log(`Ride ${ride._id} started after OTP verification`);

    // Re-fetch the ride to ensure all populated data is current
    const updatedRide = await Ride.findById(ride._id).populate('driver rider', 'name phone vehicleInfo rating currentLocation');

    res.json({
      message: 'Ride started successfully',
      ride: updatedRide || ride
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update ride status
router.patch('/:rideId/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const ride = await Ride.findById(req.params.rideId).populate('driver rider');

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check authorization
    const isDriver = req.user._id.toString() === ride.driver?._id?.toString();
    const isRider = req.user._id.toString() === ride.rider._id.toString();

    if (!isDriver && !isRider) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Handle driver_arrived status - generate OTP
    if (status === 'driver_arrived') {
      ride.status = status;
      ride.driverArrivedAt = new Date();
      
      // Generate 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 minutes
      
      ride.otp = {
        code: otp,
        expiresAt,
        verified: false
      };
      
      await ride.save();
      
      console.log(`OTP generated for ride ${ride._id}: ${otp}`);
      
      // Emit driver arrived event to rider with OTP
      const io = req.app.get('io');
      if (io) {
        io.to(ride.rider._id.toString()).emit('driver-arrived', {
          rideId: ride._id,
          otp: otp, // Show OTP to rider
          driver: {
            name: ride.driver.name,
            phone: ride.driver.phone,
            location: ride.driver.currentLocation
          }
        });
        // Also emit ride status update
        io.to(ride.rider._id.toString()).emit('ride-status-update', { 
          rideId: ride._id, 
          status: 'driver_arrived',
          ride: ride 
        });
        io.to(ride.driver._id.toString()).emit('ride-status-update', { 
          rideId: ride._id, 
          status: 'driver_arrived',
          ride: ride 
        });
      }
    } else if (status === 'completed') {
      ride.status = status;
      ride.completedAt = new Date();
      
      // Make driver available again
      if (ride.driver) {
        const driver = await User.findById(ride.driver._id);
        if (driver) {
          driver.isAvailable = true;
          driver.totalRides += 1;
          await driver.save();
        }
      }
      
      await ride.save();

      // Notify both parties
      const io = req.app.get('io');
      if (io) {
        io.to(ride.rider._id.toString()).emit('ride-status-update', { 
          rideId: ride._id, 
          status: 'completed',
          ride: ride 
        });
        if (ride.driver) {
          io.to(ride.driver._id.toString()).emit('ride-status-update', { 
            rideId: ride._id, 
            status: 'completed',
            ride: ride 
          });
        }
      }
    } else {
      ride.status = status;
      
      if (status === 'in_progress') {
        ride.startedAt = new Date();
      }
      
      await ride.save();

      // Notify both parties
      const io = req.app.get('io');
      if (io) {
        io.to(ride.rider._id.toString()).emit('ride-status-update', { 
          rideId: ride._id, 
          status: status,
          ride: ride 
        });
        if (ride.driver) {
          io.to(ride.driver._id.toString()).emit('ride-status-update', { 
            rideId: ride._id, 
            status: status,
            ride: ride 
          });
        }
      }
    }

    res.json({
      message: `Ride status updated to ${status}`,
      ride: ride
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's rides
router.get('/my-rides', authenticate, async (req, res) => {
  try {
    const field = req.user.role === 'driver' ? 'driver' : 'rider';
    const rides = await Ride.find({ [field]: req.user._id })
      .populate('driver rider', 'name phone vehicleInfo rating')
      .sort({ createdAt: -1 });

    res.json(rides);
  } catch (error) {
    console.error('Get rides error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single ride
router.get('/:rideId', authenticate, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId)
      .populate('driver rider', 'name phone vehicleInfo rating currentLocation');

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check authorization
    const isDriver = req.user._id.toString() === ride.driver?._id?.toString();
    const isRider = req.user._id.toString() === ride.rider._id.toString();

    if (!isDriver && !isRider) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(ride);
  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel ride
router.post('/:rideId/cancel', authenticate, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const isRider = req.user._id.toString() === ride.rider.toString();
    const isDriver = req.user._id.toString() === ride.driver?.toString();

    if (!isRider && !isDriver) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (['completed', 'cancelled'].includes(ride.status)) {
      return res.status(400).json({ message: 'Cannot cancel this ride' });
    }

    ride.status = 'cancelled';
    await ride.save();

    // Make driver available if they had accepted
    if (ride.driver) {
      const driver = await User.findById(ride.driver);
      if (driver) {
        driver.isAvailable = true;
        await driver.save();
      }
    }

    // Notify both parties
    const io = req.app.get('io');
    if (io) {
      io.to(ride.rider.toString()).emit('ride-cancelled', { rideId: ride._id });
      if (ride.driver) {
        io.to(ride.driver.toString()).emit('ride-cancelled', { rideId: ride._id });
      }
    }

    res.json(ride);
  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all pending rides (available for any driver to accept)
router.get('/pending/all', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can view pending rides' });
    }

    const pendingRides = await Ride.find({
      status: 'pending',
      driver: null
    })
    .populate('rider', 'name phone')
    .sort({ createdAt: -1 });

    res.json(pendingRides);
  } catch (error) {
    console.error('Get pending rides error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
