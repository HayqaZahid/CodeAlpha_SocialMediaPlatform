const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        console.log(' Auth middleware - Token received:', token ? 'Yes' : 'No');
        
        if (!token) {
            console.log(' No token provided');
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(' Decoded token user ID:', decoded.userId);
        
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error(' Token verification failed:', error.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth;