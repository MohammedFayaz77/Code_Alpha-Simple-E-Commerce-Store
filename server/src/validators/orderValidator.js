const { body } = require('express-validator');

const checkoutValidator = [
  body('recipientName')
    .trim()
    .notEmpty()
    .withMessage('Recipient full name is required'),
  body('recipientPhone')
    .trim()
    .notEmpty()
    .withMessage('Recipient phone number is required'),
  body('shippingAddress')
    .trim()
    .notEmpty()
    .withMessage('Shipping address is required'),
  body('shippingCity')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('shippingPostalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal/Zip code is required'),
  body('paymentMethod')
    .trim()
    .isIn(['CARD', 'COD', 'UPI'])
    .withMessage('Payment method must be one of: CARD, COD, UPI')
];

module.exports = { checkoutValidator };
