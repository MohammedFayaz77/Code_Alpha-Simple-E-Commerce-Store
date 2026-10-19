const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

describe('Fayaz Event Management API Tests', () => {
  let fayazToken = '';
  let memberToken = '';
  let createdProjectId = null;
  let createdTaskId = null;
  let createdChecklistId = null;

  beforeAll(async () => {
    // Seed database is already populated, or we can use the seeded test accounts
    // Login as Fayaz (Admin / Owner)
    const fayazRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'fayaz@eventflow.io',
        password: 'Fayaz@123'
      });
    
    if (fayazRes.status === 200) {
      fayazToken = fayazRes.body.token;
    }

    // Login as Sarah (Member)
    const sarahRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'sarah.chen@eventflow.io',
        password: 'Password@123'
      });

    if (sarahRes.status === 200) {
      memberToken = sarahRes.body.token;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Health and System Endpoints', () => {
    it('GET /api/health should return 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('Fayaz Event Management API');
      expect(res.body.category).toBe('Project Management Tool');
    });

    it('GET /api/nonexistent should return 404', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Authentication Flow & Security', () => {
    const testEmail = `test.planner.${Date.now()}@eventflow.io`;

    it('POST /api/auth/register should create new user and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Planner',
          email: testEmail,
          password: 'Password@123',
          roleTitle: 'Event Producer'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testEmail);
    });

    it('POST /api/auth/register should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User',
          email: testEmail,
          password: 'Password@123'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword999!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me should return current user when authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${fayazToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('fayaz@eventflow.io');
    });
  });

  describe('3. Project Management & Access Control', () => {
    it('GET /api/projects should return user projects with calculated stats', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${fayazToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.projects)).toBe(true);
      expect(res.body.projects.length).toBeGreaterThan(0);
      expect(res.body.projects[0].stats).toBeDefined();
    });

    it('POST /api/projects should create a new event project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${fayazToken}`)
        .send({
          title: 'Automated Test Music Gala 2026',
          description: 'Testing event project creation and Kanban pipeline',
          category: 'Music Festival',
          venue: 'Grand Arena',
          budget: 50000,
          color: '#8b5cf6'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.project.title).toBe('Automated Test Music Gala 2026');
      createdProjectId = res.body.project.id;
    });

    it('GET /api/projects/:id should return single project details', async () => {
      const res = await request(app)
        .get(`/api/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${fayazToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.project.id).toBe(createdProjectId);
    });

    it('POST /api/projects/:id/members should add a team member', async () => {
      const res = await request(app)
        .post(`/api/projects/${createdProjectId}/members`)
        .set('Authorization', `Bearer ${fayazToken}`)
        .send({
          email: 'sarah.chen@eventflow.io',
          role: 'ADMIN'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.member.role).toBe('ADMIN');
    });
  });

  describe('4. Task Management, Kanban Board & Checklists', () => {
    it('POST /api/projects/:projectId/tasks should create a task with checklist', async () => {
      const res = await request(app)
        .post(`/api/projects/${createdProjectId}/tasks`)
        .set('Authorization', `Bearer ${fayazToken}`)
        .send({
          title: 'Setup High-Power Acoustic Array',
          description: 'Calibrate subwoofer arrays and delay towers for the main stage.',
          status: 'TODO',
          priority: 'URGENT',
          category: 'AV & Tech',
          checklist: ['Rig line array cables', 'Perform frequency sweep']
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.task.title).toBe('Setup High-Power Acoustic Array');
      expect(res.body.task.checklist.length).toBe(2);
      createdTaskId = res.body.task.id;
      createdChecklistId = res.body.task.checklist[0].id;
    });

    it('GET /api/projects/:projectId/tasks should return tasks with checklist progress', async () => {
      const res = await request(app)
        .get(`/api/projects/${createdProjectId}/tasks`)
        .set('Authorization', `Bearer ${fayazToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.tasks.some(t => t.id === createdTaskId)).toBe(true);
    });

    it('PATCH /api/tasks/:id/status should move task along Kanban column', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${createdTaskId}/status`)
        .set('Authorization', `Bearer ${fayazToken}`)
        .send({
          status: 'IN_PROGRESS'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.task.status).toBe('IN_PROGRESS');
    });

    it('PATCH /api/tasks/:id/checklist/:itemId should toggle checklist completion', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${createdTaskId}/checklist/${createdChecklistId}`)
        .set('Authorization', `Bearer ${fayazToken}`)
        .send({
          isCompleted: true
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.item.isCompleted).toBe(true);
    });
  });

  describe('5. Comments, Notifications & Activity Auditing', () => {
    it('POST /api/tasks/:taskId/comments should add a discussion comment', async () => {
      const res = await request(app)
        .post(`/api/tasks/${createdTaskId}/comments`)
        .set('Authorization', `Bearer ${fayazToken}`)
        .send({
          content: 'Acoustic sweep scheduled for 14:00 today. Ear protection mandatory.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.comment.content).toContain('Acoustic sweep');
    });

    it('GET /api/projects/:id/activities should show activity audit history', async () => {
      const res = await request(app)
        .get(`/api/projects/${createdProjectId}/activities`)
        .set('Authorization', `Bearer ${fayazToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.activities.length).toBeGreaterThan(0);
    });

    it('GET /api/notifications should return user notification feed', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${fayazToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.notifications)).toBe(true);
    });
  });

  describe('6. Dashboard KPI & Metrics', () => {
    it('GET /api/dashboard/overview should return comprehensive project & task metrics', async () => {
      const res = await request(app)
        .get('/api/dashboard/overview')
        .set('Authorization', `Bearer ${fayazToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.totalProjects).toBeGreaterThan(0);
      expect(res.body.statusCounts).toBeDefined();
      expect(res.body.priorityCounts).toBeDefined();
    });
  });
});
