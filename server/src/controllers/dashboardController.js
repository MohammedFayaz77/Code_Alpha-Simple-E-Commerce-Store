const prisma = require('../config/db');

// Overall analytics & executive dashboard metrics
async function getOverview(req, res, next) {
  try {
    const userId = req.user.id;

    // Projects the user has access to
    const accessibleProjects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        status: true,
        eventDate: true,
        venue: true,
        budget: true,
        color: true,
        updatedAt: true
      },
      orderBy: { eventDate: 'asc' }
    });

    const projectIds = accessibleProjects.map(p => p.id);

    // Fetch all tasks belonging to accessible projects
    const allTasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds }
      },
      select: {
        id: true,
        projectId: true,
        title: true,
        status: true,
        priority: true,
        category: true,
        dueDate: true,
        assigneeId: true
      }
    });

    const now = new Date();

    // Summary calculations
    const totalProjects = accessibleProjects.length;
    const activeProjects = accessibleProjects.filter(p => p.status === 'ACTIVE').length;
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === 'COMPLETED').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // User's specific workload
    const myTasks = allTasks.filter(t => t.assigneeId === userId);
    const myPendingTasks = myTasks.filter(t => t.status !== 'COMPLETED').length;
    const myOverdueTasks = myTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'COMPLETED').length;
    const totalOverdueTasks = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'COMPLETED').length;

    // Distribution by Status
    const statusCounts = {
      BACKLOG: allTasks.filter(t => t.status === 'BACKLOG').length,
      TODO: allTasks.filter(t => t.status === 'TODO').length,
      IN_PROGRESS: allTasks.filter(t => t.status === 'IN_PROGRESS').length,
      REVIEW: allTasks.filter(t => t.status === 'REVIEW').length,
      COMPLETED: completedTasks
    };

    // Distribution by Priority
    const priorityCounts = {
      LOW: allTasks.filter(t => t.priority === 'LOW').length,
      MEDIUM: allTasks.filter(t => t.priority === 'MEDIUM').length,
      HIGH: allTasks.filter(t => t.priority === 'HIGH').length,
      URGENT: allTasks.filter(t => t.priority === 'URGENT').length
    };

    // Distribution by Category
    const categoryCounts = {};
    allTasks.forEach(t => {
      const cat = t.category || 'Operations';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Upcoming event projects (with days countdown)
    const upcomingEvents = accessibleProjects
      .filter(p => p.eventDate && new Date(p.eventDate) >= now)
      .map(p => {
        const diffMs = new Date(p.eventDate).getTime() - now.getTime();
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return {
          ...p,
          daysLeft
        };
      })
      .slice(0, 5);

    // Recent activity log
    const recentActivities = await prisma.activity.findMany({
      where: {
        projectId: { in: projectIds }
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        },
        project: {
          select: { id: true, title: true, color: true }
        },
        task: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 8
    });

    res.status(200).json({
      success: true,
      stats: {
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        completionRate,
        myPendingTasks,
        myOverdueTasks,
        totalOverdueTasks
      },
      statusCounts,
      priorityCounts,
      categoryCounts,
      upcomingEvents,
      recentActivities
    });
  } catch (error) {
    next(error);
  }
}

// Get all tasks assigned to logged-in user
async function getMyTasks(req, res, next) {
  try {
    const userId = req.user.id;
    const { status, priority } = req.query;

    const whereClause = { assigneeId: userId };

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (priority && priority !== 'ALL') {
      whereClause.priority = priority;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: {
          select: { id: true, title: true, color: true, category: true }
        },
        checklist: {
          orderBy: { orderIndex: 'asc' }
        },
        _count: {
          select: { comments: true }
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' },
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

module.exports = {
  getOverview,
  getMyTasks
};
