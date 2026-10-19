import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CreateProjectModal from './components/CreateProjectModal';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import KanbanBoardPage from './pages/KanbanBoardPage';
import MyTasksPage from './pages/MyTasksPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', color: 'var(--text-secondary)' }}>
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Live Toast Overlay from WebSocket Notification Events
function NotificationAlertToast() {
  const { activeAlert } = useNotifications();

  if (!activeAlert) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '24px',
        zIndex: 9999,
        background: 'var(--bg-surface)',
        border: '1px solid var(--primary)',
        borderLeft: '4px solid var(--primary)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.25rem',
        boxShadow: 'var(--shadow-xl)',
        maxWidth: '360px',
        animation: 'slideUp 200ms ease-out',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{activeAlert.title}</strong>
        <span style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 600 }}>LIVE</span>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
        {activeAlert.message}
      </p>
    </div>
  );
}

function MainLayout() {
  const [showGlobalCreateProject, setShowGlobalCreateProject] = useState(false);

  return (
    <div className="app-container">
      <Navbar onOpenCreateProject={() => setShowGlobalCreateProject(true)} />
      <NotificationAlertToast />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/board"
            element={
              <ProtectedRoute>
                <KanbanBoardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <KanbanBoardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tasks"
            element={
              <ProtectedRoute>
                <MyTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Create Project Modal */}
      {showGlobalCreateProject && (
        <CreateProjectModal
          onClose={() => setShowGlobalCreateProject(false)}
          onProjectCreated={() => {
            window.location.href = '/projects';
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <MainLayout />
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
