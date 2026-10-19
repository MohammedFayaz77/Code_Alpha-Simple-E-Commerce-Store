import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CalendarDays,
  FolderKanban,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  MapPin,
  Flag,
  Activity
} from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getOverview();
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading executive dashboard metrics...</p>
      </div>
    );
  }

  const { stats, statusCounts, priorityCounts, categoryCounts, upcomingEvents, recentActivities } = data || {};

  return (
    <div className="main-content">
      {/* Header & Greetings */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Here is your event production pipeline and team workload summary.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Plus size={16} /> Launch New Project
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
            <FolderKanban size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.totalProjects || 0}</div>
            <div className="stat-label">Active Projects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.totalTasks || 0}</div>
            <div className="stat-label">Total Pipeline Tasks</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.completionRate || 0}%</div>
            <div className="stat-label">Task Completion Rate</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: stats?.totalOverdueTasks > 0 ? '#ef4444' : 'inherit' }}>
              {stats?.totalOverdueTasks || 0}
            </div>
            <div className="stat-label">Overdue Tasks</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Status Pipeline & Upcoming Events */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* Kanban Status Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flag size={18} color="#6366f1" /> Workflow Pipeline Distribution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#cbd5e1' }}>Backlog (Planning)</span>
                <strong>{statusCounts?.BACKLOG || 0}</strong>
              </div>
              <div className="subtask-progress-bar">
                <div className="subtask-progress-fill" style={{ width: `${stats?.totalTasks ? ((statusCounts?.BACKLOG || 0) / stats.totalTasks) * 100 : 0}%`, background: '#94a3b8' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#a5b4fc' }}>To Do (Ready for Pickup)</span>
                <strong>{statusCounts?.TODO || 0}</strong>
              </div>
              <div className="subtask-progress-bar">
                <div className="subtask-progress-fill" style={{ width: `${stats?.totalTasks ? ((statusCounts?.TODO || 0) / stats.totalTasks) * 100 : 0}%`, background: '#6366f1' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#fbbf24' }}>In Progress (Active Work)</span>
                <strong>{statusCounts?.IN_PROGRESS || 0}</strong>
              </div>
              <div className="subtask-progress-bar">
                <div className="subtask-progress-fill" style={{ width: `${stats?.totalTasks ? ((statusCounts?.IN_PROGRESS || 0) / stats.totalTasks) * 100 : 0}%`, background: '#f59e0b' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#38bdf8' }}>Review (Quality & Permits)</span>
                <strong>{statusCounts?.REVIEW || 0}</strong>
              </div>
              <div className="subtask-progress-bar">
                <div className="subtask-progress-fill" style={{ width: `${stats?.totalTasks ? ((statusCounts?.REVIEW || 0) / stats.totalTasks) * 100 : 0}%`, background: '#0ea5e9' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#6ee7b7' }}>Completed (Delivered)</span>
                <strong>{statusCounts?.COMPLETED || 0}</strong>
              </div>
              <div className="subtask-progress-bar">
                <div className="subtask-progress-fill" style={{ width: `${stats?.totalTasks ? ((statusCounts?.COMPLETED || 0) / stats.totalTasks) * 100 : 0}%`, background: '#10b981' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Event Countdowns */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#f59e0b" /> Upcoming Event Countdowns
            </h3>
            <Link to="/projects" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
              View All
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(!upcomingEvents || upcomingEvents.length === 0) ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No upcoming events scheduled.</p>
            ) : (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: `4px solid ${event.color || '#6366f1'}`
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>{event.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={12} /> {event.venue || 'Venue TBD'}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: event.daysLeft <= 14 ? '#f59e0b' : '#10b981'
                      }}
                    >
                      {event.daysLeft} days left
                    </span>
                    <br />
                    <Link
                      to={`/projects/${event.id}/board`}
                      style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                    >
                      Board <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="#10b981" /> Live Project Audit Timeline
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(!recentActivities || recentActivities.length === 0) ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent activity records.</p>
          ) : (
            recentActivities.map((act) => (
              <div
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="user-avatar" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                    {act.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.user?.name} </span>
                    <span style={{ color: 'var(--text-secondary)' }}>{act.details}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                      in {act.project?.title}
                    </span>
                  </div>
                </div>

                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={() => {
            fetchOverview();
          }}
        />
      )}
    </div>
  );
}
