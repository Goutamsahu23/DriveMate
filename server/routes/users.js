import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user location
router.patch('/location', authenticate, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    req.user.currentLocation = { lat, lng };
    await req.user.save();

    res.json({ message: 'Location updated', location: req.user.currentLocation });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update driver availability
router.patch('/availability', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can update availability' });
    }

    const { isAvailable } = req.body;
    req.user.isAvailable = isAvailable;
    await req.user.save();

    res.json({ message: 'Availability updated', isAvailable: req.user.isAvailable });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nearby drivers
router.get('/drivers/nearby', authenticate, async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const drivers = await User.find({
      role: 'driver',
      isAvailable: true,
      currentLocation: { $exists: true }
    }).select('name phone vehicleInfo rating currentLocation');

    // Calculate distance and filter (within 10km)
    const nearbyDrivers = drivers
      .map(driver => {
        if (!driver.currentLocation) return null;
        
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          driver.currentLocation.lat,
          driver.currentLocation.lng
        );
        
        return { ...driver.toObject(), distance };
      })
      .filter(driver => driver && driver.distance <= 10)
      .sort((a, b) => a.distance - b.distance);

    res.json(nearbyDrivers);
  } catch (error) {
    console.error('Get nearby drivers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Calculate distance helper
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default router;
