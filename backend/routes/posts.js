const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'username profilePicture')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username profilePicture'
                }
            })
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { content, image } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Post content is required' });
        }

        const post = new Post({
            user: req.userId,
            content: content.trim(),
            image: image || null
        });

        await post.save();
        await post.populate('user', 'username profilePicture');

        res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post' });
    }
});

router.post('/:postId/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).populate('user');
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(req.userId);
        
        if (likeIndex > -1) {
          
            post.likes.splice(likeIndex, 1);
            await post.save();
            
            res.json({ message: 'Post unliked', liked: false });
        } else {
           
            post.likes.push(req.userId);
            await post.save();

            if (post.user._id.toString() !== req.userId) {
                const Notification = require('../models/Notification');
                const notification = new Notification({
                    fromUser: req.userId,
                    toUser: post.user._id,
                    type: 'like',
                    post: post._id,
                    read: false
                });
                await notification.save();
                console.log(' Like notification created');
            }

            res.json({ message: 'Post liked', liked: true });
        }
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ message: 'Error liking post' });
    }
});

router.post('/:postId/comments', auth, async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        const post = await Post.findById(req.params.postId).populate('user');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = new Comment({
            user: req.userId,
            post: post._id,
            content: content.trim()
        });

        await comment.save();
        
        post.comments.push(comment._id);
        await post.save();

        await comment.populate('user', 'username profilePicture');
        
        if (post.user._id.toString() !== req.userId) {
            const Notification = require('../models/Notification');
            const notification = new Notification({
                fromUser: req.userId,
                toUser: post.user._id,
                type: 'comment',
                post: post._id,
                read: false
            });
            await notification.save();
            console.log(' Comment notification created');
        }

        res.status(201).json(comment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error adding comment' });
    }
});

router.delete('/comments/:commentId', auth, async (req, res) => {
    try {
        console.log('Deleting comment:', req.params.commentId);
        
        const comment = await Comment.findById(req.params.commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        console.log('Comment found, user:', comment.user, 'current user:', req.userId);

        if (comment.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }
        await Post.findByIdAndUpdate(comment.post, {
            $pull: { comments: comment._id }
        });

        await Comment.findByIdAndDelete(req.params.commentId);

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ 
            message: 'Error deleting comment',
            error: error.message 
        });
    }
});

router.put('/comments/:commentId', auth, async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        const comment = await Comment.findById(req.params.commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.user.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to edit this comment' });
        }

        comment.content = content.trim();
        await comment.save();

        await comment.populate('user', 'username profilePicture');

        res.json(comment);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Error updating comment' });
    }
});

router.delete('/:postId', auth, async (req, res) => {
    try {
        console.log(' DELETE POST REQUEST - Post ID:', req.params.postId);
        console.log(' User ID making request:', req.userId);

        const post = await Post.findById(req.params.postId);
        
        if (!post) {
            console.log(' Post not found');
            return res.status(404).json({ message: 'Post not found' });
        }

        console.log(' Post found - Post User:', post.user.toString(), 'Request User:', req.userId);

        if (post.user.toString() !== req.userId) {
            console.log(' Unauthorized: User does not own this post');
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        console.log(' Deleting comments for post:', post._id);
       
        await Comment.deleteMany({ post: post._id });

        console.log(' Deleting post:', post._id);
        
        await Post.findByIdAndDelete(req.params.postId);

        console.log(' Post deleted successfully');
        res.json({ message: 'Post deleted successfully' });

    } catch (error) {
        console.error(' ERROR deleting post:', error);
        res.status(500).json({ 
            message: 'Error deleting post',
            error: error.message 
        });
    }
});
module.exports = router;