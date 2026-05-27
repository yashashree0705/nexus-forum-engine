const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get All Topics
router.get('/', async (req, res) => {
  try {
    const topics = await Topic.find().populate('creator', 'username points level badge');
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Topic
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const newTopic = new Topic({ title, description, category, creator: req.user.id });
    await newTopic.save();

    // Reward points for starting discussions
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 15 } });

    res.status(201).json(newTopic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Gamified Upvote Logic Vector
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const topic = await Topic.findById(req.id || req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    if (topic.upvotes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already upvoted' });
    }

    topic.downvotes = topic.downvotes.filter(id => id.toString() !== req.user.id);
    topic.upvotes.push(req.user.id);
    await topic.save();

    // Award author points
    await User.findByIdAndUpdate(topic.creator, { $inc: { points: 10 } });

    res.json({ upvotes: topic.upvotes.length, downvotes: topic.downvotes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;