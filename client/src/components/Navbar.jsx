import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  CalendarDays,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Bell,
  Plus,
  LogOut,
  User,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ onOpenCreateProject }) {
  const { user, isAuthenticated, logout, fastDemoLogin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
        setShowDemoMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDemoSwitch = async (email) => {
    setShowDemoMenu(false);
    setShowUserMenu(false);
    await fastDemoLogin(email);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="brand-logo">
          <div className="brand-icon">
            <CalendarDays size={20} />
          </div>
          <div>
            <span style={{ fontWeight: 800, letterSpacing: '-0.03em' }}>EventFlow</span>
            <span style={{ fontSize: '0.75rem', marginLeft: '0.4rem', color: '#818cf8', fontWeight: 600, padding: '2px 6px', background: 'rgba(99,102,241,0.15)', borderRadius: '4px' }}>
              Fayaz Management
            </span>
          </div>
        </Link>

        {/* Authenticated Nav Links */}
        {isAuthenticated && (
          <div className="nav-links">
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <LayoutDashboard size={17} />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/projects"
              className={`nav-link ${isActive('/projects') || location.pathname.startsWith('/projects/') ? 'active' : ''}`}
            >
              <FolderKanban size={17} />
              <span>Projects</span>
            </Link>

            <Link
              to="/my-tasks"
              className={`nav-link ${isActive('/my-tasks') ? 'active' : ''}`}
            >
              <CheckSquare size={17} />
              <span>My Tasks</span>
            </Link>
          </div>
        )}

        {/* Action Controls & Profile */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              {/* Quick Create Project Button */}
              {onOpenCreateProject && (
                <button
                  onClick={onOpenCreateProject}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Plus size={16} />
                  <span>New Project</span>
                </button>
              )}

              {/* Notification Bell Dropdown */}
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button
                  className="btn-icon"
                  style={{ position: 'relative' }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="notification-popover">
                    <div className="notification-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Bell size={16} color="#6366f1" />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Activity Alerts</span>
                        {unreadCount > 0 && (
                          <span className="badge badge-urgent" style={{ fontSize: '0.65rem' }}>
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          style={{ fontSize: '0.75rem', color: '#818cf8', cursor: 'pointer' }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="notification-list">
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <CheckCircle size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                          <p style={{ fontSize: '0.85rem' }}>You're all caught up!</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.link) navigate(n.link);
                              setShowNotifications(false);
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                {n.title}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile & Demo Switcher */}
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                <div
                  className="user-badge"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{user.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.roleTitle || 'Team'}</span>
                  </div>
                  <ChevronDown size={14} color="var(--text-muted)" />
                </div>

                {showUserMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      width: '240px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-xl)',
                      zIndex: 200,
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{user.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                    </div>

                    <div style={{ padding: '0.4rem' }}>
                      <Link
                        to="/profile"
                        className="nav-link"
                        style={{ padding: '0.5rem 0.75rem' }}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={16} />
                        <span>Profile & Settings</span>
                      </Link>

                      {/* Demo Switch Trigger */}
                      <button
                        onClick={() => setShowDemoMenu(!showDemoMenu)}
                        className="nav-link"
                        style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', justifyContent: 'space-between' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Sparkles size={16} color="#818cf8" />
                          <span>Switch Demo Role</span>
                        </div>
                        <ChevronDown size={14} />
                      </button>

                      {showDemoMenu && (
                        <div style={{ margin: '0.25rem 0.5rem 0.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <button
                            onClick={() => handleDemoSwitch('fayaz@eventflow.io')}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', textAlign: 'left', borderRadius: '4px', color: '#a5b4fc', background: user.email === 'fayaz@eventflow.io' ? 'var(--primary-light)' : 'transparent' }}
                          >
                            ⭐ Fayaz (Director)
                          </button>
                          <button
                            onClick={() => handleDemoSwitch('sarah.chen@eventflow.io')}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', textAlign: 'left', borderRadius: '4px', color: '#a5b4fc', background: user.email === 'sarah.chen@eventflow.io' ? 'var(--primary-light)' : 'transparent' }}
                          >
                            🎬 Sarah (Stage / AV)
                          </button>
                          <button
                            onClick={() => handleDemoSwitch('alex.morgan@eventflow.io')}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', textAlign: 'left', borderRadius: '4px', color: '#a5b4fc', background: user.email === 'alex.morgan@eventflow.io' ? 'var(--primary-light)' : 'transparent' }}
                          >
                            🚚 Alex (Logistics)
                          </button>
                          <button
                            onClick={() => handleDemoSwitch('priya.sharma@eventflow.io')}
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', textAlign: 'left', borderRadius: '4px', color: '#a5b4fc', background: user.email === 'priya.sharma@eventflow.io' ? 'var(--primary-light)' : 'transparent' }}
                          >
                            🥂 Priya (VIP Relations)
                          </button>
                        </div>
                      )}

                      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.4rem 0' }} />

                      <button
                        onClick={handleLogout}
                        className="nav-link"
                        style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.75rem', color: '#f87171' }}
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
