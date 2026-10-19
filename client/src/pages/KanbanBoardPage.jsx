import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService, taskService } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';
import CreateTaskModal from '../components/CreateTaskModal';
import TeamModal from '../components/TeamModal';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  Circle,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const COLUMNS = [
  { id: 'BACKLOG', title: 'Planning / Backlog', color: '#94a3b8', icon: Layers },
  { id: 'TODO', title: 'To Do', color: '#6366f1', icon: Circle },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#f59e0b', icon: Clock },
  { id: 'REVIEW', title: 'Review & Approvals', color: '#0ea5e9', icon: AlertCircle },
  { id: 'COMPLETED', title: 'Completed & Ready', color: '#10b981', icon: CheckCircle2 }
];

export default function KanbanBoardPage() {
  const { id } = useParams();
  const projectId = parseInt(id, 10);
  const { user } = useAuth();
  const { socket, joinProject, leaveProject } = useSocket();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [activeTaskModalId, setActiveTaskModalId] = useState(null);
  const [createTaskColumn, setCreateTaskColumn] = useState(null); // column id or null
  const [showTeamModal, setShowTeamModal] = useState(false);

  // Load project details and tasks
  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projRes, tasksRes] = await Promise.all([
        projectService.getById(projectId),
        taskService.getByProject(projectId)
      ]);

      if (projRes.data.success) {
        setProject(projRes.data.project);
      }
      if (tasksRes.data.success) {
        setTasks(tasksRes.data.tasks);
      }
    } catch (err) {
      console.error('Failed to load project board data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
    joinProject(projectId);

    return () => {
      leaveProject(projectId);
    };
  }, [projectId]);

  // Real-time WebSocket Listeners
  useEffect(() => {
    if (!socket) return;

    const handleTaskCreated = (newTask) => {
      setTasks((prev) => {
        if (prev.some((t) => t.id === newTask.id)) return prev;
        return [...prev, newTask];
      });
    };

    const handleTaskMoved = ({ taskId, newStatus }) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    };

    const handleTaskUpdated = (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
      );
    };

    const handleTaskDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    };

    const handleChecklistUpdated = ({ taskId, item }) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const exists = (t.checklist || []).some((c) => c.id === item.id);
          const nextChecklist = exists
            ? t.checklist.map((c) => (c.id === item.id ? item : c))
            : [...(t.checklist || []), item];
          return { ...t, checklist: nextChecklist };
        })
      );
    };

    socket.on('task_created', handleTaskCreated);
    socket.on('task_moved', handleTaskMoved);
    socket.on('task_updated', handleTaskUpdated);
    socket.on('task_deleted', handleTaskDeleted);
    socket.on('checklist_updated', handleChecklistUpdated);

    return () => {
      socket.off('task_created', handleTaskCreated);
      socket.off('task_moved', handleTaskMoved);
      socket.off('task_updated', handleTaskUpdated);
      socket.off('task_deleted', handleTaskDeleted);
      socket.off('checklist_updated', handleChecklistUpdated);
    };
  }, [socket]);

  // Handle single-click status moves
  const handleMoveStatus = async (taskId, nextStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );

    try {
      await taskService.updateStatus(taskId, nextStatus);
    } catch (err) {
      console.error('Failed to move task status:', err);
      loadProjectData(); // rollback
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      // Priority
      if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) {
        return false;
      }

      // Assignee
      if (assigneeFilter !== 'ALL') {
        if (assigneeFilter === 'UNASSIGNED') {
          if (task.assigneeId) return false;
        } else if (task.assigneeId?.toString() !== assigneeFilter) {
          return false;
        }
      }

      // Category
      if (categoryFilter !== 'ALL' && task.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, priorityFilter, assigneeFilter, categoryFilter]);

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading live project board...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h3>Project not found</h3>
        <Link to="/projects" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Projects
        </Link>
      </div>
    );
  }

  // Days left calculation
  let daysLeftText = null;
  if (project.eventDate) {
    const diffDays = Math.ceil((new Date(project.eventDate) - new Date()) / (1000 * 60 * 60 * 24));
    daysLeftText = diffDays > 0 ? `${diffDays} days until event` : 'Event Day or Past';
  }

  return (
    <div className="main-content" style={{ maxWidth: '1600px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 85px)' }}>
      {/* Top Breadcrumb & Project Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
            <Link to="/projects" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ArrowLeft size={14} /> Projects
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ color: project.color || 'var(--primary)', fontWeight: 600 }}>{project.category}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: project.color || '#6366f1',
                boxShadow: `0 0 8px ${project.color || '#6366f1'}`
              }}
            />
            <h1 style={{ fontSize: '1.7rem', fontWeight: 800 }}>{project.title}</h1>
          </div>

          {/* Subheader info: Venue, Event Date, Live WebSocket status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.35rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {project.venue && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={13} color="#f59e0b" /> {project.venue}
              </span>
            )}
            {project.eventDate && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={13} color="#818cf8" /> {daysLeftText}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Live WebSocket Sync
            </span>
          </div>
        </div>

        {/* Action Controls: Team Member Stack & "+ Add Task" */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Team Members Button */}
          <button
            onClick={() => setShowTeamModal(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {(project.members || []).slice(0, 3).map((m, idx) => (
                <div
                  key={m.userId || idx}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#4f46e5',
                    marginLeft: idx > 0 ? '-6px' : 0,
                    border: '1px solid var(--bg-surface)',
                    overflow: 'hidden',
                    fontSize: '0.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700
                  }}
                >
                  {m.user?.name?.charAt(0) || 'U'}
                </div>
              ))}
            </div>
            <span>Team ({project.members?.length || 1})</span>
          </button>

          <button
            onClick={() => setCreateTaskColumn('TODO')}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.65rem 1rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 240px' }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            className="form-input"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', height: 'auto' }}
            placeholder="Filter tasks in this board..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Priority Filter */}
          <select
            className="form-select"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', width: 'auto' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Assignee Filter */}
          <select
            className="form-select"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', width: 'auto' }}
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="ALL">All Assignees</option>
            <option value="UNASSIGNED">Unassigned</option>
            {(project.members || []).map((m) => (
              <option key={m.userId} value={m.userId.toString()}>
                {m.user?.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            className="form-select"
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', width: 'auto' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Venue & Staging">Venue & Staging</option>
            <option value="AV & Tech">AV & Tech</option>
            <option value="Catering & Hospitality">Catering & Hospitality</option>
            <option value="Speakers & VIP">Speakers & VIP</option>
            <option value="Marketing & PR">Marketing & PR</option>
            <option value="Finance & Legal">Finance & Legal</option>
            <option value="Operations">Operations</option>
          </select>
        </div>
      </div>

      {/* 5-Column Kanban Board Grid */}
      <div className="kanban-columns-grid">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const ColIcon = col.icon;

          return (
            <div key={col.id} className="kanban-column">
              {/* Column Header */}
              <div className="column-header">
                <div className="column-title">
                  <ColIcon size={16} color={col.color} />
                  <span>{col.title}</span>
                </div>
                <span className="column-count">{colTasks.length}</span>
              </div>

              {/* Task Cards Column Body */}
              <div className="column-tasks-list">
                {colTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No tasks in {col.title}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => setActiveTaskModalId(task.id)}
                      onMoveStatus={handleMoveStatus}
                    />
                  ))
                )}
              </div>

              {/* Quick Add Button at bottom of column */}
              <div style={{ padding: '0.65rem 0.9rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  onClick={() => setCreateTaskColumn(col.id)}
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', fontSize: '0.78rem', padding: '0.4rem', borderStyle: 'dashed' }}
                >
                  <Plus size={14} /> Add Task
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {/* 1. Task Detail Inspection Modal */}
      {activeTaskModalId && (
        <TaskDetailModal
          taskId={activeTaskModalId}
          projectMembers={project.members || []}
          onClose={() => setActiveTaskModalId(null)}
          onTaskUpdated={(updatedTask) => {
            setTasks((prev) =>
              prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
            );
          }}
          onTaskDeleted={(deletedId) => {
            setTasks((prev) => prev.filter((t) => t.id !== deletedId));
          }}
        />
      )}

      {/* 2. Create Task Modal */}
      {createTaskColumn && (
        <CreateTaskModal
          projectId={projectId}
          defaultStatus={createTaskColumn}
          projectMembers={project.members || []}
          onClose={() => setCreateTaskColumn(null)}
          onTaskCreated={(newTask) => {
            setTasks((prev) => [...prev, newTask]);
          }}
        />
      )}

      {/* 3. Team Management Modal */}
      {showTeamModal && (
        <TeamModal
          project={project}
          onClose={() => setShowTeamModal(false)}
          onMembersUpdated={(updatedMembers) => {
            setProject((prev) => ({ ...prev, members: updatedMembers }));
          }}
        />
      )}
    </div>
  );
}
