const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).send('Access denied. No token provided.');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId);
        if (!req.user) return res.status(404).send('User not found.');

        // Check if the token is close to expiration
        const now = Math.floor(Date.now() / 1000); // Current time in seconds
        if (decoded.exp - now < 300) { // If less than 5 minutes left until expiration
            // Generate a new token with extended expiration time
            const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            // Set the new token in the response headers
            res.set('Authorization', `Bearer ${newToken}`);
        }

        next();
    } catch (error) {
        res.status(400).send('Invalid token.');
    }
};

module.exports = authMiddleware;
