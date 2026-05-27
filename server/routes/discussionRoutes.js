const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const auth = require('../middleware/authMiddleware');

router.get('/', discussionController.getAllDiscussions);
router.get('/:id', discussionController.getDiscussionById);
router.post('/', auth, discussionController.createDiscussion);
router.post('/:id/upvote', auth, discussionController.upvoteDiscussion);

module.exports = router;