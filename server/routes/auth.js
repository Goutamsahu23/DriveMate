import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();

// Use same JWT_SECRET everywhere
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
console.log('[Auth Routes] Using JWT_SECRET:', JWT_SECRET === 'your-secret-key' ? 'DEFAULT' : 'FROM ENV');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('role').isIn(['rider', 'driver']).withMessage('Role must be rider or driver')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, role, vehicleInfo, driverLicense } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const userData = {
      name,
      email,
      password,
      phone,
      role
    };

    if (role === 'driver') {
      userData.vehicleInfo = vehicleInfo || {};
      userData.driverLicense = driverLicense;
    }

    const user = new User(userData);
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
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
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array())
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('Login attempt for email:', email)

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email)
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', user.email)

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email)
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Password matched, generating token')
    const token = generateToken(user._id);

    console.log('Login successful for:', user.email)
    res.json({
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
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

export default router;
