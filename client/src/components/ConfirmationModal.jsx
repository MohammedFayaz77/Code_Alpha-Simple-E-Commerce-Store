import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel
}) {
  // Listen for Escape key to close modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isDanger && (
              <div style={{ background: 'var(--danger-bg)', padding: '0.45rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger-border)' }}>
                <AlertTriangle size={20} color="var(--danger)" />
              </div>
            )}
            <h3 id="modal-title" style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>
              {title}
            </h3>
          </div>
          <button onClick={onCancel} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.925rem', lineHeight: '1.55' }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
          <button className="btn btn-outline btn-sm" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`btn btn-sm ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
