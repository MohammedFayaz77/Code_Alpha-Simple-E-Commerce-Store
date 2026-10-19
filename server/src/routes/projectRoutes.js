const express = require('express');
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  updateMemberRole,
  removeMember,
  getProjectActivities
} = require('../controllers/projectController');
const { authenticate, checkProjectAccess } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Project collections
router.get('/', getAllProjects);
router.post('/', createProject);

// Single project operations
router.get('/:id', checkProjectAccess('VIEWER'), getProjectById);
router.put('/:id', checkProjectAccess('ADMIN'), updateProject);
router.delete('/:id', checkProjectAccess('OWNER'), deleteProject);

// Project membership management
router.post('/:id/members', checkProjectAccess('ADMIN'), addMember);
router.patch('/:id/members/:userId', checkProjectAccess('ADMIN'), updateMemberRole);
router.delete('/:id/members/:userId', checkProjectAccess('ADMIN'), removeMember);

// Activity logs
router.get('/:id/activities', checkProjectAccess('VIEWER'), getProjectActivities);

module.exports = router;
