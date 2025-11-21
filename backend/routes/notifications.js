const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ toUser: req.userId })
            .populate('fromUser', 'username profilePicture')
            .populate('post')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

router.patch('/:notificationId/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.notificationId,
            toUser: req.userId
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.read = true;
        await notification.save();

        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ message: 'Error updating notification' });
    }
});

router.patch('/read-all', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { toUser: req.userId, read: false },
            { read: true }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error updating notifications:', error);
        res.status(500).json({ message: 'Error updating notifications' });
    }
});

router.get('/unread/count', auth, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            toUser: req.userId,
            read: false
        });

        res.json({ count });
    } catch (error) {
        console.error('Error counting notifications:', error);
        res.status(500).json({ message: 'Error counting notifications' });
    }
});

module.exports = router;