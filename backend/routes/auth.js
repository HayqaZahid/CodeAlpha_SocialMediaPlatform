const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, bio } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Please provide username, email and password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters'
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this email or username'
            });
        }

        const user = new User({
            username,
            email,
            password,
            bio: bio || ''
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profilePicture: user.profilePicture,
                followers: user.followers,
                following: user.following,
                createdAt: user.createdAt
            }
        });

    } catch (error) {  
        console.error('Registration error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                message: messages.join(', ')
            });
        }
        
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Username or email already exists'
            });
        }
        
        res.status(500).json({
            message: 'Error creating user',
            error: error.message
        });
    }
});  

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('Login attempt for:', username);

       
        if (!username || !password) {
            return res.status(400).json({
                message: 'Please provide username and password'
            });
        }

      
        const user = await User.findOne({
            $or: [{ email: username }, { username: username }]
        });

        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            return res.status(400).json({
                message: 'User not found. Please check your username or register first.'
            });
        }

        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid password. Please try again.'
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('Login successful for user:', user.username);

        res.json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profilePicture: user.profilePicture,
                followers: user.followers,
                following: user.following,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Error during login',
            error: error.message
        });
    }
});

router.get('/me', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.userId)
            .select('-password')
            .populate('followers', 'username profilePicture')
            .populate('following', 'username profilePicture');
            
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;