const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { checkoutValidator } = require('../validators/orderValidator');
const { validateRequest } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/checkout', checkoutValidator, validateRequest, orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:identifier', orderController.getOrderDetails);

module.exports = router;
