const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        console.log('🔐 Auth Header:', authHeader);
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token not found' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('🧠 Decoded Token:', decoded);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: 'Invalid token payload' });
        }
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    } catch (error) {
        console.error('❌ Token verification failed:', error.message);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = verifyToken;