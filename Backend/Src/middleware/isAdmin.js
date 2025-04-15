const isAdmin = (req, res, next) => {
    if (req.role !== 'admin') { // Changed req.user?.role to req.role since verifyToken sets it directly
        return res.status(403).json({ success: false, message: 'You are not authorized to perform this action.' });
    }
    next();
};

module.exports = { isAdmin }; // Named export