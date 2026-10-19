const prisma = require('../config/db');

function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `FO-${dateStr}-${randomSuffix}`;
}

/**
 * Process Checkout and Create Order
 * POST /api/orders/checkout
 */
async function createOrder(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      recipientName,
      recipientPhone,
      shippingAddress,
      shippingCity,
      shippingPostalCode,
      shippingCountry = 'India',
      paymentMethod = 'CARD',
      directItems // Optional: for direct "Buy Now" checkout without using cart
    } = req.body;

    let checkoutItems = [];

    if (directItems && Array.isArray(directItems) && directItems.length > 0) {
      // Direct checkout for items
      for (const item of directItems) {
        const prod = await prisma.product.findUnique({
          where: { id: parseInt(item.productId, 10) }
        });
        if (!prod) {
          return res.status(404).json({
            success: false,
            message: `Product with ID ${item.productId} not found`
          });
        }
        checkoutItems.push({
          product: prod,
          quantity: Math.max(1, parseInt(item.quantity, 10) || 1)
        });
      }
    } else {
      // Checkout from user's shopping cart
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: true }
      });

      if (cartItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Your shopping cart is empty'
        });
      }

      checkoutItems = cartItems.map((ci) => ({
        product: ci.product,
        quantity: ci.quantity
      }));
    }

    // Step 1: Validate stock & recalculate server-side totals
    for (const item of checkoutItems) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.product.name}". Only ${item.product.stock} available.`
        });
      }
    }

    const subtotal = checkoutItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const tax = parseFloat((subtotal * 0.05).toFixed(2));
    const shippingFee = subtotal > 100 ? 0 : 15.0;
    const total = parseFloat((subtotal + tax + shippingFee).toFixed(2));
    const orderNumber = generateOrderNumber();

    // Step 2: Atomic database transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Deduct product inventory
      for (const item of checkoutItems) {
        await tx.product.update({
          where: { id: item.product.id },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // 2. Create the order with line items
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PROCESSING',
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax,
          shippingFee,
          total,
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
          shippingAddress,
          shippingCity,
          shippingPostalCode,
          shippingCountry,
          recipientName,
          recipientPhone,
          items: {
            create: checkoutItems.map((item) => ({
              productId: item.product.id,
              productName: item.product.name,
              productImage: item.product.image,
              price: item.product.price,
              quantity: item.quantity
            }))
          }
        },
        include: {
          items: true
        }
      });

      // 3. If checked out via cart, clear the user's cart
      if (!directItems || directItems.length === 0) {
        await tx.cartItem.deleteMany({
          where: { userId }
        });
      }

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user's order history
 * GET /api/orders
 */
async function getUserOrders(req, res, next) {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get order details by ID or Order Number
 * GET /api/orders/:identifier
 */
async function getOrderDetails(req, res, next) {
  try {
    const { identifier } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const isNumeric = /^\d+$/.test(identifier);
    const where = isNumeric
      ? { id: parseInt(identifier, 10) }
      : { orderNumber: identifier };

    // If not admin, restrict to user's own orders
    if (!isAdmin) {
      where.userId = userId;
    }

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails
};
