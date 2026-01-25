import User from '../models/User.js';
import { calculateDistance } from '../utils/calculations.js';

export const updateUserLocation = async (userId, location) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.currentLocation = location;
  await user.save();

  return user.currentLocation;
};

export const updateDriverAvailability = async (driverId, isAvailable) => {
  const driver = await User.findById(driverId);
  if (!driver) {
    throw new Error('Driver not found');
  }

  if (driver.role !== 'driver') {
    throw new Error('Only drivers can update availability');
  }

  driver.isAvailable = isAvailable;
  await driver.save();

  return driver.isAvailable;
};

export const getNearbyDrivers = async (lat, lng) => {
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

  return nearbyDrivers;
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
