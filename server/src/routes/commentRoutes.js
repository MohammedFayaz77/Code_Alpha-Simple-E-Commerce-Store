const express = require('express');
const { getCommentsByTask, addComment, deleteComment } = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Delete comment by ID
router.delete('/:id', deleteComment);

module.exports = router;
