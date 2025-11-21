const express = require('express');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const router = express.Router();
router.get('/:username', auth, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
            .select('-password')
            .populate('followers', 'username profilePicture')
            .populate('following', 'username profilePicture');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});
router.put('/profile', auth, async (req, res) => {
    try {
        const { username, email, bio, profilePicture } = req.body;
        console.log('Updating profile for user:', req.userId);
        console.log('Update data:', { username, email, bio, profilePicture });
        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (bio !== undefined) updateData.bio = bio;
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
        if (username) {
            const currentUser = await User.findById(req.userId);
            if (username !== currentUser.username) {
                const existingUser = await User.findOne({ 
                    username, 
                    _id: { $ne: req.userId } 
                });
                if (existingUser) {
                    return res.status(400).json({ message: 'Username already taken' });
                }
            }
        }
        if (email) {
            const currentUser = await User.findById(req.userId);
            if (email !== currentUser.email) {
                const existingUser = await User.findOne({ 
                    email, 
                    _id: { $ne: req.userId } 
                });
                if (existingUser) {
                    return res.status(400).json({ message: 'Email already taken' });
                }
            }
        }
        const user = await User.findByIdAndUpdate(
            req.userId, 
            updateData, 
            { new: true }
        ).select('-password');
        console.log('Profile updated successfully:', user.username);

        res.json({ 
            message: 'Profile updated successfully', 
            user 
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ 
            message: 'Error updating profile',
            error: error.message 
        });
    }
});
router.post('/:userId/follow', auth, async (req, res) => {
    try {
        if (req.params.userId === req.userId) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }
        const userToFollow = await User.findById(req.params.userId);
        const currentUser = await User.findById(req.userId);

        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isFollowing = currentUser.following.includes(req.params.userId);
        if (isFollowing) {         
            await User.findByIdAndUpdate(req.userId, {
                $pull: { following: req.params.userId }
            });
            await User.findByIdAndUpdate(req.params.userId, {
                $pull: { followers: req.userId }
            });

            res.json({ message: 'Unfollowed successfully', following: false });
        } else {         
            await User.findByIdAndUpdate(req.userId, {
                $addToSet: { following: req.params.userId }
            });
            await User.findByIdAndUpdate(req.params.userId, {
                $addToSet: { followers: req.userId }
            });
            const Notification = require('../models/Notification');
            const notification = new Notification({
                fromUser: req.userId,
                toUser: req.params.userId,
                type: 'follow',
                read: false
            });
            await notification.save();
            console.log('Follow notification created');

            res.json({ message: 'Followed successfully', following: true });
        }
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ message: 'Error following user' });
    }
});

router.get('/suggestions/all', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId);
        const users = await User.find({
            _id: { 
                $ne: req.userId,
                $nin: currentUser.following 
            }
        })
        .select('username profilePicture bio followers')
        .limit(10)
        .sort({ followers: -1 });

        res.json(users);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ message: 'Error fetching suggestions' });
    }
});
module.exports = router;