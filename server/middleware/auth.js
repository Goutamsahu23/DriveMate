import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided in Authorization header');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    console.log('Attempting to verify token with JWT_SECRET:', JWT_SECRET === 'your-secret-key' ? 'default' : 'from env');
    
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded successfully, userId:', decoded.userId);
    
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('User not found for userId:', decoded.userId);
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired', code: 'TOKEN_EXPIRED' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token format', code: 'INVALID_TOKEN' });
    }
    
    res.status(401).json({ message: 'Token is not valid', code: 'VERIFICATION_FAILED' });
  }
};
