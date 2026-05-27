const Comment = require('../models/Comment');
const User = require('../models/User');

exports.getCommentsByDiscussion = async (req, res) => {
  try {
    // Look for comments tied to this specific discussion pipeline channel
    const comments = await Comment.find({ discussionId: req.params.discussionId })
      .populate('author', 'username level badge');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const newComment = new Comment({ 
      discussionId: req.params.discussionId, 
      author: req.user.id, 
      content 
    });
    await newComment.save();

    // Reward active configuration interaction with +5 XP points
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 5 } });
    
    const fullyLoadedComment = await newComment.populate('author', 'username level badge');
    res.status(201).json(fullyLoadedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};