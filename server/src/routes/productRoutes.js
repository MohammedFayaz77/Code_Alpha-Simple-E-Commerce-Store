const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { productValidator } = require('../validators/productValidator');
const { validateRequest } = require('../middleware/validate');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public catalog routes
router.get('/', productController.getProducts);
router.get('/:identifier', productController.getProduct);

// Admin-only management routes
router.post('/', authenticate, requireAdmin, productValidator, validateRequest, productController.createProduct);
router.put('/:id', authenticate, requireAdmin, productValidator, validateRequest, productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);

module.exports = router;
