import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

export const registerUser = async (userData) => {
  const { name, email, password, phone, role, vehicleInfo, driverLicense } = userData;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Create user
  const newUserData = {
    name,
    email,
    password,
    phone,
    role
  };

  if (role === 'driver') {
    newUserData.vehicleInfo = vehicleInfo || {};
    newUserData.driverLicense = driverLicense;
  }

  const user = new User(newUserData);
  await user.save();

  const token = generateToken(user._id);

  return {
    token,
    user: {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isAvailable: user.isAvailable || false,
      currentLocation: user.currentLocation
    }
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isAvailable: user.isAvailable,
      currentLocation: user.currentLocation
    }
  };
};
