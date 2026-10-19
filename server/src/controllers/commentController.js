const prisma = require('../config/db');
const { emitToProject, emitToUser } = require('../config/socket');

// Get comments for a task
async function getCommentsByTask(req, res, next) {
  try {
    const taskId = parseInt(req.params.taskId, 10);

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, roleTitle: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({
      success: true,
      comments
    });
  } catch (error) {
    next(error);
  }
}

// Add comment to task
async function addComment(req, res, next) {
  try {
    const taskId = parseInt(req.params.taskId, 10);
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const comment = await prisma.comment.create({
      data: {
        taskId,
        userId: req.user.id,
        content: content.trim()
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, roleTitle: true }
        }
      }
    });

    // Record activity
    await prisma.activity.create({
      data: {
        projectId: task.projectId,
        taskId: task.id,
        userId: req.user.id,
        action: 'COMMENT_ADDED',
        details: `Commented on "${task.title}": "${content.length > 50 ? content.slice(0, 50) + '...' : content}"`
      }
    });

    // Notify assignee if not the commenter
    if (task.assigneeId && task.assigneeId !== req.user.id) {
      const notif = await prisma.notification.create({
        data: {
          userId: task.assigneeId,
          title: `New Comment on "${task.title}"`,
          message: `${req.user.name}: "${content.length > 60 ? content.slice(0, 60) + '...' : content}"`,
          type: 'COMMENT_ADDED',
          link: `/projects/${task.projectId}/board`
        }
      });
      emitToUser(task.assigneeId, 'notification', notif);
    }

    // Broadcast comment to everyone watching the project
    emitToProject(task.projectId, 'comment_added', { taskId, comment });

    res.status(201).json({
      success: true,
      message: 'Comment added.',
      comment
    });
  } catch (error) {
    next(error);
  }
}

// Delete comment
async function deleteComment(req, res, next) {
  try {
    const commentId = parseInt(req.params.id, 10);

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { task: true }
    });

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    // Only author or system admin can delete
    if (comment.userId !== req.user.id && req.user.systemRole !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment.' });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    emitToProject(comment.task.projectId, 'comment_deleted', {
      taskId: comment.taskId,
      commentId
    });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCommentsByTask,
  addComment,
  deleteComment
};
