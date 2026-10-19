import React, { useState, useEffect } from 'react';
import { dashboardService, taskService } from '../services/api';
import { Link } from 'react-router-dom';
import TaskDetailModal from '../components/TaskDetailModal';
import {
  CheckSquare,
  Calendar,
  AlertCircle,
  Clock,
  Filter,
  ArrowRight,
  FolderKanban
} from 'lucide-react';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [activeTaskModalId, setActiveTaskModalId] = useState(null);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getMyTasks({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined
      });
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Failed to load my tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [statusFilter, priorityFilter]);

  const handleToggleStatus = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      await taskService.updateStatus(taskId, nextStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
      );
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>My Assigned Tasks</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Your personal priority list across all active conferences and events.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="BACKLOG">Backlog</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading your assigned tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <CheckSquare size={48} style={{ margin: '0 auto 1rem', color: '#10b981', opacity: 0.5 }} />
          <h3>No assigned tasks</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            You're currently clear of any pending task assignments.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            const checklist = task.checklist || [];
            const completedCount = checklist.filter((i) => i.isCompleted).length;

            return (
              <div
                key={task.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  transition: 'border-color 150ms'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 300px' }}>
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => handleToggleStatus(task.id, task.status)}
                    style={{ width: '18px', height: '18px', accentColor: '#10b981', cursor: 'pointer' }}
                  />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <span
                        className={`badge ${
                          task.priority === 'URGENT'
                            ? 'badge-urgent'
                            : task.priority === 'HIGH'
                            ? 'badge-high'
                            : task.priority === 'MEDIUM'
                            ? 'badge-medium'
                            : 'badge-low'
                        }`}
                      >
                        {task.priority}
                      </span>

                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: task.project?.color || '#a5b4fc',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <FolderKanban size={12} /> {task.project?.title}
                      </span>
                    </div>

                    <h4
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)'
                      }}
                      onClick={() => setActiveTaskModalId(task.id)}
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {/* Subtasks Count */}
                  {checklist.length > 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckSquare size={14} /> {completedCount}/{checklist.length}
                    </span>
                  )}

                  {/* Due Date */}
                  {task.dueDate && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} /> {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  )}

                  {/* Status Badge */}
                  <span className="badge badge-status" style={{ fontSize: '0.75rem' }}>
                    {task.status}
                  </span>

                  {/* Inspect Details Button */}
                  <button
                    onClick={() => setActiveTaskModalId(task.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Modal */}
      {activeTaskModalId && (
        <TaskDetailModal
          taskId={activeTaskModalId}
          onClose={() => setActiveTaskModalId(null)}
          onTaskUpdated={() => fetchMyTasks()}
          onTaskDeleted={() => fetchMyTasks()}
        />
      )}
    </div>
  );
}
