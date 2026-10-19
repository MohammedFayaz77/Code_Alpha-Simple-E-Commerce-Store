const prisma = require('../config/db');

/**
 * Get Admin dashboard business analytics and metrics
 * GET /api/admin/stats
 */
async function getAdminStats(req, res, next) {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      orders,
      lowStockProducts,
      recentOrders
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({
        where: {
          status: { not: 'CANCELLED' }
        },
        select: { total: true }
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 } },
        select: { id: true, name: true, stock: true, image: true, price: true }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: true
        }
      })
    ]);

    const totalRevenue = orders.reduce((sum, ord) => sum + ord.total, 0);

    // Status breakdown
    const pendingOrdersCount = await prisma.order.count({ where: { status: 'PENDING' } });
    const processingOrdersCount = await prisma.order.count({ where: { status: 'PROCESSING' } });
    const shippedOrdersCount = await prisma.order.count({ where: { status: 'SHIPPED' } });
    const deliveredOrdersCount = await prisma.order.count({ where: { status: 'DELIVERED' } });
    const cancelledOrdersCount = await prisma.order.count({ where: { status: 'CANCELLED' } });

    res.json({
      success: true,
      data: {
        metrics: {
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalOrders,
          totalProducts,
          totalUsers,
          lowStockCount: lowStockProducts.length
        },
        orderStatusCounts: {
          pending: pendingOrdersCount,
          processing: processingOrdersCount,
          shipped: shippedOrdersCount,
          delivered: deliveredOrdersCount,
          cancelled: cancelledOrdersCount
        },
        lowStockProducts,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all orders across the entire store (Admin)
 * GET /api/admin/orders
 */
async function getAllOrders(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (parsedPage - 1) * parsedLimit;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: parsedLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          items: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          total,
          page: parsedPage,
          limit: parsedLimit,
          totalPages: Math.ceil(total / parsedLimit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update order status (Admin)
 * PATCH /api/admin/orders/:id/status
 */
async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const orderId = parseInt(id, 10);

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // If order was cancelled and is now set to CANCELLED, restore inventory
    if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity }
            }
          });
        }

        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'CANCELLED',
            paymentStatus: existingOrder.paymentStatus === 'PAID' ? 'REFUNDED' : 'FAILED'
          }
        });
      });
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status,
          ...(status === 'DELIVERED' && { paymentStatus: 'PAID' })
        }
      });
    }

    const updated = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true
      }
    });

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: { order: updated }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminStats,
  getAllOrders,
  updateOrderStatus
};
