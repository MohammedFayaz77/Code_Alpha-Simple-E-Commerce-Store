const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

function generateToken(userId) {
  const secret = process.env.JWT_SECRET || 'super_secret_fayaz_event_management_jwt_key_2026_dev';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ userId }, secret, { expiresIn });
}

// Register new user
async function register(req, res, next) {
  try {
    const { name, email, password, roleTitle } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user account with this email address already exists.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        roleTitle: roleTitle?.trim() || 'Event Coordinator',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
      },
      select: {
        id: true,
        name: true,
        email: true,
        roleTitle: true,
        avatar: true,
        bio: true,
        systemRole: true,
        createdAt: true
      }
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
}

// Login existing user
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Both email and password are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    const token = generateToken(user.id);

    const userSafe = {
      id: user.id,
      name: user.name,
      email: user.email,
      roleTitle: user.roleTitle,
      avatar: user.avatar,
      bio: user.bio,
      systemRole: user.systemRole,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userSafe
    });
  } catch (error) {
    next(error);
  }
}

// Get current authenticated user profile
async function getMe(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
}

// Update profile
async function updateProfile(req, res, next) {
  try {
    const { name, roleTitle, bio, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(roleTitle !== undefined && { roleTitle: roleTitle.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(avatar && { avatar: avatar.trim() })
      },
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

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
}

// Get all users (for assigning tasks or inviting to projects)
async function getAllUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        roleTitle: true,
        avatar: true
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  getAllUsers
};
