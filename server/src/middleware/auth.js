const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

/**
 * Middleware to verify JWT authentication token
 */
async function authenticate(req, res, next) {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_fayaz_event_management_jwt_key_2026_dev';
    const decoded = jwt.verify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        roleTitle: true,
        avatar: true,
        bio: true,
        systemRole: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.'
      });
    }
    next(error);
  }
}

/**
 * Middleware to check project membership and role permissions
 * Roles hierarchy: OWNER > ADMIN > MEMBER > VIEWER
 */
function checkProjectAccess(minRequiredRole = 'VIEWER') {
  const roleWeights = {
    OWNER: 4,
    ADMIN: 3,
    MEMBER: 2,
    VIEWER: 1
  };

  return async (req, res, next) => {
    try {
      const projectId = parseInt(req.params.projectId || req.params.id, 10);
      if (isNaN(projectId)) {
        return res.status(400).json({ success: false, message: 'Invalid project ID format.' });
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, roleTitle: true, avatar: true }
              }
            }
          }
        }
      });

      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      // If user is project owner or system admin, grant OWNER privileges
      let userRole = null;
      if (project.ownerId === req.user.id || req.user.systemRole === 'ADMIN') {
        userRole = 'OWNER';
      } else {
        const membership = project.members.find(m => m.userId === req.user.id);
        if (membership) {
          userRole = membership.role;
        }
      }

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a member of this project.'
        });
      }

      const userWeight = roleWeights[userRole] || 0;
      const requiredWeight = roleWeights[minRequiredRole] || 1;

      if (userWeight < requiredWeight) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Requires '${minRequiredRole}' role or higher (your role: '${userRole}').`
        });
      }

      req.project = project;
      req.projectRole = userRole;
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  authenticate,
  checkProjectAccess
};
