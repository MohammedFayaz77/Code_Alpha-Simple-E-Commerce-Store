import React, { useState } from 'react';
import { taskService } from '../services/api';
import { X, Plus, Trash2, Calendar, User, Flag, Tag, CheckSquare } from 'lucide-react';

export default function CreateTaskModal({ projectId, defaultStatus = 'TODO', projectMembers = [], onClose, onTaskCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [priority, setPriority] = useState('MEDIUM');
  const [category, setCategory] = useState('Operations');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [checklistItems, setChecklistItems] = useState([]);
  const [currentChecklistText, setCurrentChecklistText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddChecklist = (e) => {
    e.preventDefault();
    if (!currentChecklistText.trim()) return;
    setChecklistItems([...checklistItems, currentChecklistText.trim()]);
    setCurrentChecklistText('');
  };

  const handleRemoveChecklist = (index) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      const res = await taskService.create(projectId, {
        title: title.trim(),
        description: description?.trim() || null,
        status,
        priority,
        category,
        dueDate: dueDate || null,
        assigneeId: assigneeId ? parseInt(assigneeId, 10) : null,
        checklist: checklistItems
      });

      if (res.data.success) {
        onTaskCreated(res.data.task);
        onClose();
      }
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Error creating task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '650px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} color="#6366f1" />
            <h3 style={{ fontSize: '1.1rem' }}>Create New Task</h3>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Task Title *</label>
              <input
                type="text"
                className="form-input"
                required
                autoFocus
                placeholder="e.g. Confirm VIP Keynote speaker travel arrangements"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Flag size={13} /> Column Status
                </label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="BACKLOG">Backlog</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label className="form-label">Priority</label>
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Tag size={13} /> Event Category
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
                  <Calendar size={13} /> Due Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={13} /> Assign To Member
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

            <div>
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Add instructions, dimensions, venue coordinates, or notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Subtasks Checklist */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckSquare size={13} /> Initial Subtasks
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Verify wireless microphone battery frequencies"
                  value={currentChecklistText}
                  onChange={(e) => setCurrentChecklistText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklist(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddChecklist}
                  className="btn btn-secondary btn-sm"
                  disabled={!currentChecklistText.trim()}
                >
                  <Plus size={14} /> Add
                </button>
              </div>

              {checklistItems.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                  {checklistItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.35rem 0.65rem',
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <span>• {item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklist(idx)}
                        className="btn-icon"
                        style={{ padding: '0.2rem', color: '#f87171' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading || !title.trim()}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
