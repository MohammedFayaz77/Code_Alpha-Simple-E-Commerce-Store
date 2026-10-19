const prisma = require('../config/db');
const { emitToProject, emitToUser } = require('../config/socket');

// Get all tasks for a project
async function getTasksByProject(req, res, next) {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const { status, priority, category, assigneeId, search } = req.query;

    const whereClause = { projectId };

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (priority && priority !== 'ALL') {
      whereClause.priority = priority;
    }

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (assigneeId && assigneeId !== 'ALL') {
      whereClause.assigneeId = parseInt(assigneeId, 10);
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true, roleTitle: true }
        },
        creator: {
          select: { id: true, name: true, avatar: true }
        },
        checklist: {
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: [
        { status: 'asc' },
        { orderIndex: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
}

// Get single task by ID with complete details
async function getTaskById(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { id: true, title: true, color: true }
        },
        assignee: {
          select: { id: true, name: true, email: true, avatar: true, roleTitle: true }
        },
        creator: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        checklist: {
          orderBy: { orderIndex: 'asc' }
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true, roleTitle: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        activities: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
}

// Create new task
async function createTask(req, res, next) {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    const { title, description, status = 'TODO', priority = 'MEDIUM', category = 'Operations', dueDate, assigneeId, checklist } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    // Get count of existing tasks in this status for orderIndex
    const currentCount = await prisma.task.count({
      where: { projectId, status }
    });

    const newTask = await prisma.task.create({
      data: {
        projectId,
        title: title.trim(),
        description: description?.trim() || null,
        status,
        priority,
        category,
        dueDate: dueDate ? new Date(dueDate) : null,
        orderIndex: currentCount,
        assigneeId: assigneeId ? parseInt(assigneeId, 10) : null,
        creatorId: req.user.id,
        ...(Array.isArray(checklist) && checklist.length > 0 && {
          checklist: {
            create: checklist.map((item, index) => ({
              title: typeof item === 'string' ? item : item.title,
              isCompleted: false,
              orderIndex: index
            }))
          }
        })
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true, roleTitle: true }
        },
        creator: {
          select: { id: true, name: true, avatar: true }
        },
        checklist: true,
        _count: {
          select: { comments: true }
        }
      }
    });

    // Record activity
    await prisma.activity.create({
      data: {
        projectId,
        taskId: newTask.id,
        userId: req.user.id,
        action: 'TASK_CREATED',
        details: `Created task "${newTask.title}"`
      }
    });

    // Notify assignee if assigned to someone else
    if (newTask.assigneeId && newTask.assigneeId !== req.user.id) {
      const notification = await prisma.notification.create({
        data: {
          userId: newTask.assigneeId,
          title: 'New Task Assigned',
          message: `${req.user.name} assigned you to "${newTask.title}".`,
          type: 'TASK_ASSIGNED',
          link: `/projects/${projectId}/board`
        }
      });
      emitToUser(newTask.assigneeId, 'notification', notification);
    }

    emitToProject(projectId, 'task_created', newTask);

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task: newTask
    });
  } catch (error) {
    next(error);
  }
}

// Update task details
async function updateTask(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { title, description, priority, category, dueDate, assigneeId } = req.body;

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existingTask) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(priority && { priority }),
        ...(category && { category }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId ? parseInt(assigneeId, 10) : null })
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true, roleTitle: true }
        },
        creator: {
          select: { id: true, name: true, avatar: true }
        },
        checklist: {
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: { comments: true }
        }
      }
    });

    // Record activity
    await prisma.activity.create({
      data: {
        projectId: updatedTask.projectId,
        taskId: updatedTask.id,
        userId: req.user.id,
        action: 'TASK_UPDATED',
        details: `Updated details for task "${updatedTask.title}"`
      }
    });

    // Notify new assignee if changed
    if (assigneeId && parseInt(assigneeId, 10) !== existingTask.assigneeId && parseInt(assigneeId, 10) !== req.user.id) {
      const notification = await prisma.notification.create({
        data: {
          userId: parseInt(assigneeId, 10),
          title: 'Task Assigned',
          message: `${req.user.name} assigned you to "${updatedTask.title}".`,
          type: 'TASK_ASSIGNED',
          link: `/projects/${updatedTask.projectId}/board`
        }
      });
      emitToUser(parseInt(assigneeId, 10), 'notification', notification);
    }

    emitToProject(updatedTask.projectId, 'task_updated', updatedTask);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
}

// Move task status (Kanban column update)
async function updateTaskStatus(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { status, orderIndex } = req.body;

    const validStatuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status specified.' });
    }

    const currentTask = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!currentTask) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const previousStatus = currentTask.status;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status,
        ...(orderIndex !== undefined && { orderIndex: parseInt(orderIndex, 10) })
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatar: true, roleTitle: true }
        },
        creator: {
          select: { id: true, name: true, avatar: true }
        },
        checklist: {
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: { comments: true }
        }
      }
    });

    // Record activity
    const actionName = status === 'COMPLETED' ? 'TASK_COMPLETED' : 'STATUS_CHANGED';
    await prisma.activity.create({
      data: {
        projectId: updatedTask.projectId,
        taskId: updatedTask.id,
        userId: req.user.id,
        action: actionName,
        details: `Moved "${updatedTask.title}" from ${previousStatus} to ${status}`
      }
    });

    // Emit live real-time update
    emitToProject(updatedTask.projectId, 'task_moved', {
      taskId: updatedTask.id,
      previousStatus,
      newStatus: status,
      task: updatedTask
    });

    res.status(200).json({
      success: true,
      message: `Task moved to ${status}.`,
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
}

// Delete task
async function deleteTask(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);

    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    // Record activity
    await prisma.activity.create({
      data: {
        projectId: task.projectId,
        userId: req.user.id,
        action: 'TASK_DELETED',
        details: `Deleted task "${task.title}"`
      }
    });

    emitToProject(task.projectId, 'task_deleted', { taskId, projectId: task.projectId });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

// Add checklist item
async function addChecklistItem(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Checklist item title is required.' });
    }

    const currentCount = await prisma.checklistItem.count({ where: { taskId } });

    const item = await prisma.checklistItem.create({
      data: {
        taskId,
        title: title.trim(),
        orderIndex: currentCount
      }
    });

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (task) {
      emitToProject(task.projectId, 'checklist_updated', { taskId, item });
    }

    res.status(201).json({
      success: true,
      item
    });
  } catch (error) {
    next(error);
  }
}

// Toggle checklist item completion
async function toggleChecklistItem(req, res, next) {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    const { isCompleted } = req.body;

    const updatedItem = await prisma.checklistItem.update({
      where: { id: itemId },
      data: { isCompleted: Boolean(isCompleted) }
    });

    const task = await prisma.task.findUnique({ where: { id: updatedItem.taskId } });
    if (task) {
      // Record activity
      await prisma.activity.create({
        data: {
          projectId: task.projectId,
          taskId: task.id,
          userId: req.user.id,
          action: 'CHECKLIST_TOGGLED',
          details: `${isCompleted ? 'Checked off' : 'Unchecked'} "${updatedItem.title}"`
        }
      });

      emitToProject(task.projectId, 'checklist_updated', { taskId: task.id, item: updatedItem });
    }

    res.status(200).json({
      success: true,
      item: updatedItem
    });
  } catch (error) {
    next(error);
  }
}

// Delete checklist item
async function deleteChecklistItem(req, res, next) {
  try {
    const itemId = parseInt(req.params.itemId, 10);

    const item = await prisma.checklistItem.findUnique({ where: { id: itemId } });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Checklist item not found.' });
    }

    await prisma.checklistItem.delete({ where: { id: itemId } });

    const task = await prisma.task.findUnique({ where: { id: item.taskId } });
    if (task) {
      emitToProject(task.projectId, 'checklist_deleted', { taskId: task.id, itemId });
    }

    res.status(200).json({
      success: true,
      message: 'Checklist item deleted.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem
};
