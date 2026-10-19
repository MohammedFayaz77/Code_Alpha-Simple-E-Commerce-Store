const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);

router.get('/stats', adminController.getAdminStats);
router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

module.exports = router;
