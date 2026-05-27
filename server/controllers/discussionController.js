const Discussion = require('../models/Discussion');
const User = require('../models/User');

exports.getAllDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find().populate('creator', 'username level badge').sort({ createdAt: -1 });
    res.json(discussions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id).populate('creator', 'username level badge');
    if (!discussion) return res.status(404).json({ message: 'Discussion stream terminal dark.' });
    res.json(discussion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createDiscussion = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const newDiscussion = new Discussion({ title, description, category, creator: req.user.id });
    await newDiscussion.save();

    // Gamification Hook: award 15 XP for creating a topic
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 15 } });
    res.status(201).json(newDiscussion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.upvoteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion link broken.' });

    if (discussion.upvotes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Discussion node already upvoted.' });
    }

    discussion.upvotes.push(req.user.id);
    await discussion.save();

    // Award topic creator 10 points
    await User.findByIdAndUpdate(discussion.creator, { $inc: { points: 10 } });
    res.json(discussion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};