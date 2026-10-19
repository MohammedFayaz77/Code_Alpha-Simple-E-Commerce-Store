import React, { useState, useEffect } from 'react';
import { taskService, commentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Calendar,
  User,
  CheckSquare,
  MessageSquare,
  History,
  Trash2,
  Send,
  Plus,
  AlertCircle,
  Flag,
  Tag
} from 'lucide-react';

export default function TaskDetailModal({ taskId, projectMembers = [], onClose, onTaskUpdated, onTaskDeleted }) {
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('comments'); // 'comments' or 'activity'

  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [category, setCategory] = useState('Operations');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  // Checklist state
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  // Comment state
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const res = await taskService.getById(taskId);
      if (res.data.success) {
        const t = res.data.task;
        setTask(t);
        setTitle(t.title);
        setDescription(t.description || '');
        setStatus(t.status);
        setPriority(t.priority);
        setCategory(t.category);
        setDueDate(t.dueDate ? t.dueDate.split('T')[0] : '');
        setAssigneeId(t.assigneeId ? t.assigneeId.toString() : '');
      }
    } catch (err) {
      console.error('Failed to load task details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    try {
      setSaving(true);
      const res = await taskService.update(taskId, {
        title,
        description,
        priority,
        category,
        dueDate: dueDate || null,
        assigneeId: assigneeId ? parseInt(assigneeId, 10) : null
      });

      // If status changed
      if (status !== task.status) {
        await taskService.updateStatus(taskId, status);
      }

      if (res.data.success) {
        onTaskUpdated(res.data.task);
        onClose();
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      alert('Error updating task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddChecklistItem = async (e) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;

    try {
      const res = await taskService.addChecklist(taskId, newChecklistTitle.trim());
      if (res.data.success) {
        setTask((prev) => ({
          ...prev,
          checklist: [...(prev.checklist || []), res.data.item]
        }));
        setNewChecklistTitle('');
        onTaskUpdated({ ...task });
      }
    } catch (err) {
      console.error('Failed to add checklist item:', err);
    }
  };

  const handleToggleChecklist = async (itemId, currentStatus) => {
    try {
      const nextStatus = !currentStatus;
      await taskService.toggleChecklist(taskId, itemId, nextStatus);
      setTask((prev) => ({
        ...prev,
        checklist: prev.checklist.map((item) =>
          item.id === itemId ? { ...item, isCompleted: nextStatus } : item
        )
      }));
      onTaskUpdated({ ...task });
    } catch (err) {
      console.error('Failed to toggle checklist:', err);
    }
  };

  const handleDeleteChecklistItem = async (itemId) => {
    try {
      await taskService.deleteChecklist(taskId, itemId);
      setTask((prev) => ({
        ...prev,
        checklist: prev.checklist.filter((item) => item.id !== itemId)
      }));
      onTaskUpdated({ ...task });
    } catch (err) {
      console.error('Failed to delete checklist item:', err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await commentService.add(taskId, newComment.trim());
      if (res.data.success) {
        setTask((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), res.data.comment]
        }));
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentService.delete(commentId);
      setTask((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c.id !== commentId)
      }));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm(`Are you sure you want to delete task "${task.title}"?`)) return;
    try {
      await taskService.delete(taskId);
      onTaskDeleted(taskId);
      onClose();
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert('Error deleting task.');
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ padding: '3rem', textAlign: 'center' }}>
          <p>Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const checklist = task.checklist || [];
  const completedCount = checklist.filter((item) => item.isCompleted).length;
  const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '820px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: task.project?.color || '#6366f1'
              }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {task.project?.title}
            </span>
          </div>

          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Title Input */}
          <div>
            <label className="form-label">Task Title</label>
            <input
              type="text"
              className="form-input"
              style={{ fontSize: '1.1rem', fontWeight: 700 }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rig Stage 4K LED Screen"
            />
          </div>

          {/* Core Properties Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Flag size={14} /> Status Column
              </label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Under Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertCircle size={14} /> Priority
              </label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Tag size={14} /> Category
              </label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Venue & Staging">Venue & Staging</option>
                <option value="AV & Tech">AV & Tech</option>
                <option value="Catering & Hospitality">Catering & Hospitality</option>
                <option value="Speakers & VIP">Speakers & VIP</option>
                <option value="Marketing & PR">Marketing & PR</option>
                <option value="Finance & Legal">Finance & Legal</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} /> Due Date
              </label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} /> Assignee
              </label>
              <select
                className="form-select"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {projectMembers.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.name} ({m.user.roleTitle || m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Task Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide event details, specifications, vendor contacts, or instructions..."
            />
          </div>

          {/* Subtasks / Checklist Manager */}
          <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare size={16} color="#10b981" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Checklist & Subtasks</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {completedCount} of {checklist.length} ({progressPercent}%)
              </span>
            </div>

            {checklist.length > 0 && (
              <div className="subtask-progress-bar" style={{ height: '6px', marginBottom: '1rem' }}>
                <div className="subtask-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            )}

            {/* Checklist Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              {checklist.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() => handleToggleChecklist(item.id, item.isCompleted)}
                      style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                    />
                    <span
                      style={{
                        fontSize: '0.85rem',
                        textDecoration: item.isCompleted ? 'line-through' : 'none',
                        color: item.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)'
                      }}
                    >
                      {item.title}
                    </span>
                  </label>

                  <button
                    onClick={() => handleDeleteChecklistItem(item.id)}
                    className="btn-icon"
                    style={{ padding: '0.2rem', color: '#f87171' }}
                    title="Remove item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Checklist Item Form */}
            <form onSubmit={handleAddChecklistItem} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                placeholder="+ Add subtask or checklist item..."
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-sm" disabled={!newChecklistTitle.trim()}>
                <Plus size={14} /> Add
              </button>
            </form>
          </div>

          {/* Tabs: Comments vs Activity Audit Log */}
          <div>
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
              <button
                onClick={() => setActiveTab('comments')}
                style={{
                  padding: '0.5rem 0.75rem',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: activeTab === 'comments' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'comments' ? '2px solid var(--primary)' : 'none'
                }}
              >
                <MessageSquare size={15} /> Comments ({task.comments?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                style={{
                  padding: '0.5rem 0.75rem',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: activeTab === 'activity' ? 'var(--primary)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'activity' ? '2px solid var(--primary)' : 'none'
                }}
              >
                <History size={15} /> Activity Audit ({task.activities?.length || 0})
              </button>
            </div>

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
                  {(!task.comments || task.comments.length === 0) ? (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                      No comments yet. Start the team discussion below.
                    </p>
                  ) : (
                    task.comments.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          background: 'var(--bg-card)',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="user-avatar" style={{ width: '22px', height: '22px', fontSize: '0.65rem' }}>
                              {c.user?.name?.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{c.user?.name}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {(c.userId === user?.id || user?.systemRole === 'ADMIN') && (
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="btn-icon"
                              style={{ padding: '0.15rem', color: '#f87171' }}
                              title="Delete comment"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                          {c.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Input Form */}
                <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Write a comment or mention an update..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={submittingComment || !newComment.trim()}
                  >
                    <Send size={14} /> Send
                  </button>
                </form>
              </div>
            )}

            {/* Activity Audit Tab */}
            {activeTab === 'activity' && (
              <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(!task.activities || task.activities.length === 0) ? (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                    No activity recorded yet.
                  </p>
                ) : (
                  task.activities.map((act) => (
                    <div
                      key={act.id}
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.5rem 0.75rem',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.user?.name}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{act.details}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(act.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={handleDeleteTask}
            className="btn btn-danger btn-sm"
          >
            <Trash2 size={14} /> Delete Task
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              className="btn btn-primary btn-sm"
              disabled={saving || !title.trim()}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
