import React from 'react';
import {
  Calendar,
  CheckSquare,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Clock
} from 'lucide-react';

export default function TaskCard({ task, onClick, onMoveStatus }) {
  const priorityClass = {
    URGENT: 'badge-urgent',
    HIGH: 'badge-high',
    MEDIUM: 'badge-medium',
    LOW: 'badge-low'
  }[task.priority] || 'badge-low';

  // Subtask progress
  const checklist = task.checklist || [];
  const completedCount = checklist.filter((item) => item.isCompleted).length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Due date countdown
  let dueDateText = null;
  let isOverdue = false;
  let isDueSoon = false;

  if (task.dueDate) {
    const due = new Date(task.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (task.status !== 'COMPLETED') {
      if (diffDays < 0) {
        isOverdue = true;
        dueDateText = `${Math.abs(diffDays)}d overdue`;
      } else if (diffDays === 0) {
        isDueSoon = true;
        dueDateText = 'Due today';
      } else if (diffDays <= 3) {
        isDueSoon = true;
        dueDateText = `${diffDays}d left`;
      } else {
        dueDateText = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } else {
      dueDateText = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  // Status transitions
  const statuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
  const currentIndex = statuses.indexOf(task.status);
  const prevStatus = currentIndex > 0 ? statuses[currentIndex - 1] : null;
  const nextStatus = currentIndex < statuses.length - 1 ? statuses[currentIndex + 1] : null;

  return (
    <div
      className="task-card"
      onClick={() => onClick(task)}
    >
      <div className="task-card-header">
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className={`badge ${priorityClass}`}>
            {task.priority}
          </span>
          {task.category && (
            <span className="badge badge-category" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
              {task.category}
            </span>
          )}
        </div>

        {/* Quick Move Buttons */}
        <div style={{ display: 'flex', gap: '0.2rem' }} onClick={(e) => e.stopPropagation()}>
          {prevStatus && (
            <button
              onClick={() => onMoveStatus(task.id, prevStatus)}
              className="btn-icon"
              title={`Move to ${prevStatus}`}
              style={{ padding: '0.25rem' }}
            >
              <ArrowLeft size={13} />
            </button>
          )}
          {nextStatus && (
            <button
              onClick={() => onMoveStatus(task.id, nextStatus)}
              className="btn-icon"
              title={`Move to ${nextStatus}`}
              style={{ padding: '0.25rem' }}
            >
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      <h4 className="task-card-title">{task.title}</h4>

      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      {/* Checklist Progress Bar */}
      {totalCount > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckSquare size={12} /> Subtasks
            </span>
            <span>
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="subtask-progress-bar">
            <div
              className="subtask-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="task-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {/* Due Date Indicator */}
          {dueDateText && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : 'inherit',
                fontWeight: isOverdue || isDueSoon ? 600 : 'normal'
              }}
            >
              {isOverdue ? <AlertCircle size={13} /> : <Calendar size={13} />}
              {dueDateText}
            </span>
          )}

          {/* Comments count */}
          {(task._count?.comments > 0 || task.comments?.length > 0) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <MessageSquare size={13} />
              {task._count?.comments || task.comments?.length || 0}
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        {task.assignee ? (
          <div
            title={`Assigned to ${task.assignee.name}`}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#4f46e5',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {task.assignee.avatar ? (
              <img src={task.assignee.avatar} alt={task.assignee.name} style={{ width: '100%', height: '100%' }} />
            ) : (
              task.assignee.name.charAt(0)
            )}
          </div>
        ) : (
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Unassigned</span>
        )}
      </div>
    </div>
  );
}
