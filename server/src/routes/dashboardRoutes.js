const express = require('express');
const { getOverview, getMyTasks } = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/overview', getOverview);
router.get('/my-tasks', getMyTasks);

module.exports = router;
