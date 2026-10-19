const prisma = require('../config/db');
const { emitToProject, emitToUser } = require('../config/socket');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .concat('-', Date.now().toString().slice(-4));
}

// Get all projects for current user (owned + member of)
async function getAllProjects(req, res, next) {
  try {
    const { status, category, search } = req.query;

    const whereClause = {
      OR: [
        { ownerId: req.user.id },
        { members: { some: { userId: req.user.id } } }
      ]
    };

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (category && category !== 'ALL') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } },
            { venue: { contains: search } }
          ]
        }
      ];
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true, roleTitle: true }
            }
          }
        },
        tasks: {
          select: { id: true, status: true, priority: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Compute progress stats for each project
    const formattedProjects = projects.map(p => {
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter(t => t.status === 'COMPLETED').length;
      const inProgressTasks = p.tasks.filter(t => t.status === 'IN_PROGRESS').length;
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        category: p.category,
        status: p.status,
        eventDate: p.eventDate,
        venue: p.venue,
        budget: p.budget,
        color: p.color,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        owner: p.owner,
        members: p.members,
        stats: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          progressPercentage
        }
      };
    });

    res.status(200).json({
      success: true,
      count: formattedProjects.length,
      projects: formattedProjects
    });
  } catch (error) {
    next(error);
  }
}

// Get single project by ID with members and counts
async function getProjectById(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true, roleTitle: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true, roleTitle: true }
            }
          }
        },
        tasks: {
          select: { id: true, status: true, priority: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      project: {
        ...project,
        currentUserRole: req.projectRole || 'VIEWER',
        stats: {
          totalTasks,
          completedTasks,
          progressPercentage
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

// Create new project
async function createProject(req, res, next) {
  try {
    const { title, description, category, eventDate, venue, budget, color } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Project title is required.' });
    }

    const slug = slugify(title);

    const newProject = await prisma.project.create({
      data: {
        title: title.trim(),
        slug,
        description: description?.trim() || null,
        category: category || 'Corporate Event',
        status: 'ACTIVE',
        eventDate: eventDate ? new Date(eventDate) : null,
        venue: venue?.trim() || null,
        budget: budget ? parseFloat(budget) : 0,
        color: color || '#6366f1',
        ownerId: req.user.id,
        members: {
          create: [
            {
              userId: req.user.id,
              role: 'OWNER'
            }
          ]
        }
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true, roleTitle: true }
            }
          }
        }
      }
    });

    // Record initial creation activity
    await prisma.activity.create({
      data: {
        projectId: newProject.id,
        userId: req.user.id,
        action: 'PROJECT_CREATED',
        details: `Created new project "${newProject.title}"`
      }
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      project: newProject
    });
  } catch (error) {
    next(error);
  }
}

// Update existing project
async function updateProject(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);
    const { title, description, category, status, eventDate, venue, budget, color } = req.body;

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(category && { category }),
        ...(status && { status }),
        ...(eventDate !== undefined && { eventDate: eventDate ? new Date(eventDate) : null }),
        ...(venue !== undefined && { venue: venue?.trim() || null }),
        ...(budget !== undefined && { budget: parseFloat(budget) || 0 }),
        ...(color && { color })
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatar: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        }
      }
    });

    // Record activity
    await prisma.activity.create({
      data: {
        projectId: updated.id,
        userId: req.user.id,
        action: 'PROJECT_UPDATED',
        details: `Updated project parameters for "${updated.title}"`
      }
    });

    emitToProject(projectId, 'project_updated', updated);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      project: updated
    });
  } catch (error) {
    next(error);
  }
}

// Delete project (owner only)
async function deleteProject(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);

    if (req.projectRole !== 'OWNER' && req.user.systemRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can delete this project.'
      });
    }

    await prisma.project.delete({
      where: { id: projectId }
    });

    emitToProject(projectId, 'project_deleted', { projectId });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
}

// Add member to project
async function addMember(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);
    const { email, userId, role = 'MEMBER' } = req.body;

    let targetUser = null;
    if (userId) {
      targetUser = await prisma.user.findUnique({ where: { id: parseInt(userId, 10) } });
    } else if (email) {
      targetUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    }

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found to add to project.' });
    }

    // Check if already a member
    const existing = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUser.id
        }
      }
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'User is already a member of this project.' });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: targetUser.id,
        role: role.toUpperCase()
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, roleTitle: true, avatar: true }
        }
      }
    });

    // Record activity
    await prisma.activity.create({
      data: {
        projectId,
        userId: req.user.id,
        action: 'MEMBER_ADDED',
        details: `Added ${targetUser.name} as ${role.toUpperCase()}`
      }
    });

    // Notify user
    const notification = await prisma.notification.create({
      data: {
        userId: targetUser.id,
        title: 'Added to Event Project',
        message: `${req.user.name} added you to project "${req.project.title}" as ${role.toUpperCase()}.`,
        type: 'INFO',
        link: `/projects/${projectId}/board`
      }
    });

    emitToUser(targetUser.id, 'notification', notification);
    emitToProject(projectId, 'member_added', member);

    res.status(201).json({
      success: true,
      message: 'Team member added successfully.',
      member
    });
  } catch (error) {
    next(error);
  }
}

// Update member role
async function updateMemberRole(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);
    const targetUserId = parseInt(req.params.userId, 10);
    const { role } = req.body;

    if (!['ADMIN', 'MEMBER', 'VIEWER'].includes(role?.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const member = await prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUserId
        }
      },
      data: { role: role.toUpperCase() },
      include: {
        user: {
          select: { id: true, name: true, email: true, roleTitle: true, avatar: true }
        }
      }
    });

    emitToProject(projectId, 'member_updated', member);

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully.',
      member
    });
  } catch (error) {
    next(error);
  }
}

// Remove member from project
async function removeMember(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);
    const targetUserId = parseInt(req.params.userId, 10);

    // Prevent removing project owner
    if (req.project.ownerId === targetUserId) {
      return res.status(400).json({ success: false, message: 'Cannot remove the project owner.' });
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUserId
        }
      }
    });

    emitToProject(projectId, 'member_removed', { userId: targetUserId, projectId });

    res.status(200).json({
      success: true,
      message: 'Member removed from project.'
    });
  } catch (error) {
    next(error);
  }
}

// Get project activity history
async function getProjectActivities(req, res, next) {
  try {
    const projectId = parseInt(req.params.id, 10);

    const activities = await prisma.activity.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, roleTitle: true }
        },
        task: {
          select: { id: true, title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.status(200).json({
      success: true,
      activities
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  updateMemberRole,
  removeMember,
  getProjectActivities
};
