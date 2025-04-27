const jwt = require('jsonwebtoken');

const authAdminMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Use JWT_SECRET_KEY to match generateToken.js
    req.role = decoded.role; // Set req.role for isAdmin middleware
    req.user = decoded; // Optional: Keep user data for other middleware
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You are not authorized to perform this action.' });
  }
  next();
};

module.exports = { authAdminMiddleware, isAdmin };