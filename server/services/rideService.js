import Ride from '../models/Ride.js';
import User from '../models/User.js';
import { calculateDistance, calculateFare, generateOTP, getOTPExpiration } from '../utils/calculations.js';

export const createRide = async (riderId, rideData) => {
  const { pickupLocation, dropoffLocation, rideType } = rideData;

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
    rider: riderId,
    pickupLocation,
    dropoffLocation,
    rideType,
    distance,
    fare
  });

  await ride.save();
  return ride;
};

export const acceptRide = async (rideId, driverId) => {
  const ride = await Ride.findById(rideId);
  if (!ride) {
    throw new Error('Ride not found');
  }

  if (ride.status !== 'pending') {
    throw new Error('Ride is not available');
  }

  const driver = await User.findById(driverId);
  if (!driver.isAvailable) {
    throw new Error('Driver is not available');
  }

  ride.driver = driverId;
  ride.status = 'accepted';
  ride.acceptedAt = new Date();
  await ride.save();

  // Update driver availability
  driver.isAvailable = false;
  await driver.save();

  return ride;
};

export const updateRideStatus = async (rideId, status, userId) => {
  const ride = await Ride.findById(rideId).populate('driver rider');
  if (!ride) {
    throw new Error('Ride not found');
  }

  // Check authorization
  const isDriver = userId.toString() === ride.driver?._id?.toString();
  const isRider = userId.toString() === ride.rider._id.toString();

  if (!isDriver && !isRider) {
    throw new Error('Not authorized');
  }

  // Handle driver_arrived status - generate OTP
  if (status === 'driver_arrived') {
    ride.status = status;
    ride.driverArrivedAt = new Date();
    
    const otp = generateOTP();
    const expiresAt = getOTPExpiration();
    
    ride.otp = {
      code: otp,
      expiresAt,
      verified: false
    };
    
    await ride.save();
    return { ride, otp };
  }

  // Handle completed status
  if (status === 'completed') {
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
    return { ride };
  }

  // Handle other statuses
  ride.status = status;
  if (status === 'in_progress') {
    ride.startedAt = new Date();
  }
  
  await ride.save();
  return { ride };
};

export const verifyRideOTP = async (rideId, otp, driverId) => {
  const ride = await Ride.findById(rideId).populate('driver rider');
  if (!ride) {
    throw new Error('Ride not found');
  }

  // Check if user is the driver
  if (driverId.toString() !== ride.driver._id.toString()) {
    throw new Error('Only the driver can verify OTP');
  }

  // Check if OTP exists and is not expired
  if (!ride.otp || !ride.otp.code) {
    throw new Error('OTP not generated. Driver must arrive first.');
  }

  if (new Date() > ride.otp.expiresAt) {
    throw new Error('OTP has expired. Request a new one.');
  }

  // Check if OTP matches
  if (otp !== ride.otp.code) {
    throw new Error('Invalid OTP');
  }

  // Mark OTP as verified and update ride status
  ride.otp.verified = true;
  ride.status = 'in_progress';
  ride.startedAt = new Date();
  await ride.save();

  return ride;
};

export const cancelRide = async (rideId, userId) => {
  const ride = await Ride.findById(rideId);
  if (!ride) {
    throw new Error('Ride not found');
  }

  const isRider = userId.toString() === ride.rider.toString();
  const isDriver = userId.toString() === ride.driver?.toString();

  if (!isRider && !isDriver) {
    throw new Error('Not authorized');
  }

  if (['completed', 'cancelled'].includes(ride.status)) {
    throw new Error('Cannot cancel this ride');
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

  return ride;
};

export const getUserRides = async (userId, role) => {
  const field = role === 'driver' ? 'driver' : 'rider';
  const rides = await Ride.find({ [field]: userId })
    .populate('driver rider', 'name phone vehicleInfo rating')
    .sort({ createdAt: -1 });

  return rides;
};

export const getRideById = async (rideId, userId) => {
  const ride = await Ride.findById(rideId)
    .populate('driver rider', 'name phone vehicleInfo rating currentLocation');

  if (!ride) {
    throw new Error('Ride not found');
  }

  // Check authorization
  const isDriver = userId.toString() === ride.driver?._id?.toString();
  const isRider = userId.toString() === ride.rider._id.toString();

  if (!isDriver && !isRider) {
    throw new Error('Not authorized');
  }

  return ride;
};

export const getPendingRides = async () => {
  const pendingRides = await Ride.find({
    status: 'pending',
    driver: null
  })
  .populate('rider', 'name phone')
  .sort({ createdAt: -1 });

  return pendingRides;
};
