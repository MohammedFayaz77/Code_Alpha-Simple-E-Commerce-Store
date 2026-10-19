const prisma = require('../config/db');

/**
 * Get current user's shopping cart
 * GET /api/cart
 */
async function getCart(req, res, next) {
  try {
    const userId = req.user.id;

    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: {
              select: { id: true, name: true, slug: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const subtotal = items.reduce((acc, item) => {
      return acc + (item.product.price * item.quantity);
    }, 0);

    const tax = parseFloat((subtotal * 0.05).toFixed(2));
    const shippingFee = subtotal > 100 || subtotal === 0 ? 0 : 15.0;
    const total = parseFloat((subtotal + tax + shippingFee).toFixed(2));

    res.json({
      success: true,
      data: {
        items,
        summary: {
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax,
          shippingFee,
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Add product to cart
 * POST /api/cart
 */
async function addToCart(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    const parsedProductId = parseInt(productId, 10);
    const parsedQty = Math.max(1, parseInt(quantity, 10) || 1);

    const product = await prisma.product.findUnique({
      where: { id: parsedProductId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < 1) {
      return res.status(400).json({
        success: false,
        message: 'This product is currently out of stock'
      });
    }

    // Check if product already in user's cart
    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: parsedProductId
        }
      }
    });

    let cartItem;
    if (existing) {
      const newQuantity = existing.quantity + parsedQty;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than available stock (${product.stock} in stock, currently ${existing.quantity} in cart)`
        });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
        include: { product: true }
      });
    } else {
      if (parsedQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock (${product.stock} available)`
        });
      }

      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId: parsedProductId,
          quantity: parsedQty
        },
        include: { product: true }
      });
    }

    res.json({
      success: true,
      message: 'Item added to cart',
      data: { cartItem }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update cart item quantity
 * PUT /api/cart/:id
 */
async function updateCartItem(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItemId = parseInt(id, 10);
    const parsedQty = parseInt(quantity, 10);

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: cartItemId, userId },
      include: { product: true }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    if (parsedQty <= 0) {
      // Remove item if quantity set to 0 or negative
      await prisma.cartItem.delete({
        where: { id: cartItemId }
      });

      return res.json({
        success: true,
        message: 'Item removed from cart'
      });
    }

    if (parsedQty > cartItem.product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity requested exceeds available stock (${cartItem.product.stock} available)`
      });
    }

    const updated = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: parsedQty },
      include: { product: true }
    });

    res.json({
      success: true,
      message: 'Cart updated',
      data: { cartItem: updated }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Remove item from cart
 * DELETE /api/cart/:id
 */
async function removeFromCart(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const cartItemId = parseInt(id, 10);

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: cartItemId, userId }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId }
    });

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Clear all items in cart
 * DELETE /api/cart
 */
async function clearCart(req, res, next) {
  try {
    const userId = req.user.id;

    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
