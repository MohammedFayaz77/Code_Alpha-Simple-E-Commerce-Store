const prisma = require('../config/db');

// Get all notifications for user
async function getNotifications(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false
      }
    });

    res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    next(error);
  }
}

// Mark single notification as read
async function markAsRead(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.status(200).json({
      success: true,
      notification: updated
    });
  } catch (error) {
    next(error);
  }
}

// Mark all as read
async function markAllAsRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false
      },
      data: { isRead: true }
    });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
