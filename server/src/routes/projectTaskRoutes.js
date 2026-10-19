const express = require('express');
const {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem
} = require('../controllers/taskController');
const { authenticate, checkProjectAccess } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// When mounted at /api/projects/:projectId/tasks:
router.get('/', checkProjectAccess('VIEWER'), getTasksByProject);
router.post('/', checkProjectAccess('MEMBER'), createTask);

module.exports = router;
