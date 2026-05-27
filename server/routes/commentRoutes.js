const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/authMiddleware');

router.get('/:discussionId', commentController.getCommentsByDiscussion);
router.post('/:discussionId', auth, commentController.createComment);

module.exports = router;