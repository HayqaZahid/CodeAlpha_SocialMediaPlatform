const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/socialmedia';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log(' Connected to MongoDB'))
.catch(err => console.error(' MongoDB connection error:', err));
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.get('/', (req, res) => {
    res.json({ message: 'Social Media API is running!' });
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(` API: http://localhost:${PORT}/api`);
});