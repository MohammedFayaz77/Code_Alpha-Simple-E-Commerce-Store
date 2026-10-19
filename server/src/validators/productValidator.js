const { body } = require('express-validator');

const productValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 3, max: 120 })
    .withMessage('Name must be between 3 and 120 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number greater than 0'),
  body('compareAtPrice')
    .optional({ nullable: true })
    .isFloat({ min: 0.01 })
    .withMessage('Compare at price must be a positive number'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be an integer 0 or greater'),
  body('image')
    .trim()
    .notEmpty()
    .withMessage('Product image URL is required')
    .isURL()
    .withMessage('Image must be a valid URL'),
  body('categoryId')
    .isInt({ min: 1 })
    .withMessage('Valid category ID is required')
];

module.exports = { productValidator };
