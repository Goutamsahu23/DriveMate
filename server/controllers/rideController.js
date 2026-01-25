import {
  createRide,
  acceptRide,
  updateRideStatus,
  verifyRideOTP,
  cancelRide,
  getUserRides,
  getRideById,
  getPendingRides
} from '../services/rideService.js';

export const requestRide = async (req, res) => {
  try {
    if (req.user.role !== 'rider') {
      return res.status(403).json({ message: 'Only riders can request rides' });
    }

    const ride = await createRide(req.user._id, req.body);

    // Broadcast to all drivers via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('pending-ride-available', {
        _id: ride._id,
        rideId: ride._id,
        pickupLocation: ride.pickupLocation,
        dropoffLocation: ride.dropoffLocation,
        fare: ride.fare,
        distance: ride.distance,
        rideType: ride.rideType,
        rider: {
          name: req.user.name,
          phone: req.user.phone
        },
        createdAt: ride.createdAt
      });
    }

    res.status(201).json(ride);
  } catch (error) {
    console.error('Request ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const acceptRideRequest = async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can accept rides' });
    }

    const ride = await acceptRide(req.params.rideId, req.user._id);

    // Notify rider via Socket.io
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
    if (error.message === 'Ride not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Ride is not available' || error.message === 'Driver is not available') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Accept ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const ride = await verifyRideOTP(req.params.rideId, otp, req.user._id);

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

    const updatedRide = await getRideById(ride._id, req.user._id);

    res.json({
      message: 'Ride started successfully',
      ride: updatedRide
    });
  } catch (error) {
    if (error.message === 'Ride not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('OTP') || error.message.includes('driver')) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Not authorized' || error.message === 'Only the driver can verify OTP') {
      return res.status(403).json({ message: error.message });
    }
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const result = await updateRideStatus(req.params.rideId, status, req.user._id);

    // Notify both parties via Socket.io
    const io = req.app.get('io');
    if (io) {
      if (status === 'driver_arrived') {
        io.to(result.ride.rider._id.toString()).emit('driver-arrived', {
          rideId: result.ride._id,
          otp: result.otp,
          driver: {
            name: result.ride.driver.name,
            phone: result.ride.driver.phone,
            location: result.ride.driver.currentLocation
          }
        });
      }

      io.to(result.ride.rider._id.toString()).emit('ride-status-update', {
        rideId: result.ride._id,
        status: status,
        ride: result.ride
      });
      if (result.ride.driver) {
        io.to(result.ride.driver._id.toString()).emit('ride-status-update', {
          rideId: result.ride._id,
          status: status,
          ride: result.ride
        });
      }
    }

    res.json({
      message: `Ride status updated to ${status}`,
      ride: result.ride
    });
  } catch (error) {
    if (error.message === 'Ride not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Not authorized') {
      return res.status(403).json({ message: error.message });
    }
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyRides = async (req, res) => {
  try {
    const rides = await getUserRides(req.user._id, req.user.role);
    res.json(rides);
  } catch (error) {
    console.error('Get rides error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRide = async (req, res) => {
  try {
    const ride = await getRideById(req.params.rideId, req.user._id);
    res.json(ride);
  } catch (error) {
    if (error.message === 'Ride not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Not authorized') {
      return res.status(403).json({ message: error.message });
    }
    console.error('Get ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const cancelRideRequest = async (req, res) => {
  try {
    const ride = await cancelRide(req.params.rideId, req.user._id);

    // Notify both parties via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(ride.rider.toString()).emit('ride-cancelled', { rideId: ride._id });
      if (ride.driver) {
        io.to(ride.driver.toString()).emit('ride-cancelled', { rideId: ride._id });
      }
    }

    res.json(ride);
  } catch (error) {
    if (error.message === 'Ride not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Not authorized' || error.message === 'Cannot cancel this ride') {
      return res.status(error.message === 'Cannot cancel this ride' ? 400 : 403).json({ message: error.message });
    }
    console.error('Cancel ride error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPendingRidesList = async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Only drivers can view pending rides' });
    }

    const rides = await getPendingRides();
    res.json(rides);
  } catch (error) {
    console.error('Get pending rides error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
