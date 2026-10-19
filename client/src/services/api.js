import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fayaz_eventflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear and trigger redirect if not already on auth page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        // optionally handle session expiration
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getAllUsers: () => api.get('/auth/users')
};

// Projects Endpoints
export const projectService = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
  updateMemberRole: (id, userId, data) => api.patch(`/projects/${id}/members/${userId}`, data),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
  getActivities: (id) => api.get(`/projects/${id}/activities`)
};

// Tasks & Kanban Endpoints
export const taskService = {
  getByProject: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status, orderIndex) => api.patch(`/tasks/${id}/status`, { status, orderIndex }),
  delete: (id) => api.delete(`/tasks/${id}`),
  addChecklist: (taskId, title) => api.post(`/tasks/${taskId}/checklist`, { title }),
  toggleChecklist: (taskId, itemId, isCompleted) => api.patch(`/tasks/${taskId}/checklist/${itemId}`, { isCompleted }),
  deleteChecklist: (taskId, itemId) => api.delete(`/tasks/${taskId}/checklist/${itemId}`)
};

// Comments Endpoints
export const commentService = {
  getByTask: (taskId) => api.get(`/tasks/${taskId}/comments`),
  add: (taskId, content) => api.post(`/tasks/${taskId}/comments`, { content }),
  delete: (commentId) => api.delete(`/comments/${commentId}`)
};

// Dashboard Analytics
export const dashboardService = {
  getOverview: () => api.get('/dashboard/overview'),
  getMyTasks: (params) => api.get('/dashboard/my-tasks', { params })
};

// Notifications Endpoints
export const notificationService = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all')
};

export default api;
