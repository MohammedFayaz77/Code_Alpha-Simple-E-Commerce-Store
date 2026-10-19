import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const totalTime = 3500;
    const intervalTime = 50;
    const decrement = (intervalTime / totalTime) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - decrement));
    }, intervalTime);

    const timer = setTimeout(() => {
      onClose();
    }, totalTime);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onClose]);

  const typeConfig = {
    success: {
      bg: 'var(--success-bg)',
      border: 'var(--success-border)',
      color: 'var(--success-text)',
      bar: 'var(--success)',
      icon: <CheckCircle2 size={18} color="var(--success)" />
    },
    danger: {
      bg: 'var(--danger-bg)',
      border: 'var(--danger-border)',
      color: 'var(--danger-text)',
      bar: 'var(--danger)',
      icon: <AlertCircle size={18} color="var(--danger)" />
    },
    info: {
      bg: 'var(--primary-subtle)',
      border: 'var(--primary-border)',
      color: 'var(--primary)',
      bar: 'var(--primary)',
      icon: <Info size={18} color="var(--primary)" />
    }
  };

  const current = typeConfig[type] || typeConfig.info;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`,
        color: current.color,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999,
        maxWidth: '380px',
        overflow: 'hidden',
        animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.15rem' }}>
        {current.icon}
        <span style={{ fontSize: '0.875rem', fontWeight: 600, flex: 1, lineHeight: '1.4' }}>{message}</span>
        <button
          onClick={onClose}
          style={{ color: current.color, opacity: 0.7, padding: '0.2rem', cursor: 'pointer' }}
          aria-label="Close notification"
        >
          <X size={15} />
        </button>
      </div>

      <div style={{ height: '3px', width: '100%', background: 'rgba(0, 0, 0, 0.05)' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: current.bar,
            transition: 'width 50ms linear'
          }}
        />
      </div>
    </div>
  );
}
