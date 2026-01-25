import {
  getCurrentUser,
  updateUserLocation,
  updateDriverAvailability,
  getNearbyDrivers
} from '../services/userService.js';

export const getMe = async (req, res) => {
  try {
    const user = await getCurrentUser(req.user._id);
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const location = await updateUserLocation(req.user._id, { lat, lng });
    res.json({ message: 'Location updated', location });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const availability = await updateDriverAvailability(req.user._id, isAvailable);
    res.json({ message: 'Availability updated', isAvailable: availability });
  } catch (error) {
    if (error.message === 'Only drivers can update availability') {
      return res.status(403).json({ message: error.message });
    }
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getNearbyDriversList = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const drivers = await getNearbyDrivers(lat, lng);
    res.json(drivers);
  } catch (error) {
    console.error('Get nearby drivers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
