const express = require('express');
const {
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem
} = require('../controllers/taskController');
const { getCommentsByTask, addComment } = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Individual task operations
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);

// Checklist items
router.post('/:id/checklist', addChecklistItem);
router.patch('/:id/checklist/:itemId', toggleChecklistItem);
router.delete('/:id/checklist/:itemId', deleteChecklistItem);

// Task comments
router.get('/:taskId/comments', getCommentsByTask);
router.post('/:taskId/comments', addComment);

module.exports = router;
