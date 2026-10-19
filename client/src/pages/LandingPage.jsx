import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CalendarDays,
  Kanban,
  CheckSquare,
  Users,
  Bell,
  Activity,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, fastDemoLogin } = useAuth();
  const navigate = useNavigate();

  const handleDemoAccess = async (email) => {
    try {
      await fastDemoLogin(email);
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login failed:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 2rem 4rem',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.75rem'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            background: 'var(--primary-light)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-full)',
            color: '#a5b4fc',
            fontSize: '0.82rem',
            fontWeight: 600
          }}
        >
          <Sparkles size={14} color="#818cf8" />
          <span>CodeAlpha Full Stack Internship — Task 3: Project Management Tool</span>
        </div>

        <h1
          style={{
            fontSize: '3.25rem',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            maxWidth: '900px',
            background: 'linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Collaborative Event & Project Management for Modern Teams
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            lineHeight: 1.6
          }}
        >
          Engineered by <strong>Fayaz</strong>. Orchestrate high-stakes conferences, corporate galas, and live productions with real-time Kanban boards, role-based permissions, subtask checklists, and WebSocket team updates.
        </p>

        {/* Primary Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              Open Workspace Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <button
                onClick={() => handleDemoAccess('fayaz@eventflow.io')}
                className="btn btn-primary"
                style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
              >
                Launch Demo as Fayaz (Lead Director) <ArrowRight size={18} />
              </button>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 1.5rem', fontSize: '1rem' }}>
                Sign In with Credentials
              </Link>
            </>
          )}
        </div>

        {/* 1-Click Fast Evaluator Quick Login Bar */}
        <div
          style={{
            marginTop: '2.5rem',
            padding: '1.25rem 1.75rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            maxWidth: '820px',
            width: '100%'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
            <Zap size={16} color="#fbbf24" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fbbf24' }}>
              CodeAlpha Evaluator 1-Click Access
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Click any seeded test persona to instantly authenticate and evaluate role permissions and live boards:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.65rem' }}>
            <button
              onClick={() => handleDemoAccess('fayaz@eventflow.io')}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.55rem 0.75rem', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}
            >
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>👑 Fayaz Ahmed</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lead Event Director</span>
            </button>

            <button
              onClick={() => handleDemoAccess('sarah.chen@eventflow.io')}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.55rem 0.75rem', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}
            >
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>🎬 Sarah Chen</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Creative Stage & AV</span>
            </button>

            <button
              onClick={() => handleDemoAccess('alex.morgan@eventflow.io')}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.55rem 0.75rem', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}
            >
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>🚚 Alex Morgan</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Logistics & Venue</span>
            </button>

            <button
              onClick={() => handleDemoAccess('priya.sharma@eventflow.io')}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.55rem 0.75rem', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}
            >
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>🥂 Priya Sharma</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>VIP Hospitality</span>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem 5rem', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Designed for High-Impact Delivery</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Everything expected of a modern, industry-standard project management tool.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
          <div className="card">
            <div style={{ width: '42px', height: '42px', background: 'rgba(99,102,241,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', marginBottom: '1rem' }}>
              <Kanban size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Interactive Kanban Board</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Fluid column pipelines across Backlog, To Do, In Progress, Review, and Completed with instant single-click or drag status transitions.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '42px', height: '42px', background: 'rgba(16,185,129,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', marginBottom: '1rem' }}>
              <CheckSquare size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Subtask Checklists</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Granular checklist items per task card with progress bars, completion ratios, and instant strikethroughs.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '42px', height: '42px', background: 'rgba(245,158,11,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', marginBottom: '1rem' }}>
              <Activity size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Real-Time WebSockets</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Live task updates, comments, and status movements broadcasted seamlessly across concurrent team members using Socket.io.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '42px', height: '42px', background: 'rgba(14,165,233,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: '1rem' }}>
              <Users size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Role-Based Access Control</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Project-level permission tiers: Owner, Admin, Member, and Viewer with invitation management and role adjustments.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '42px', height: '42px', background: 'rgba(236,72,153,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899', marginBottom: '1rem' }}>
              <Bell size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Notifications & Alerts</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Real-time activity alerts for assignments, mentions, comments, and impending event deadline countdowns.
            </p>
          </div>

          <div className="card">
            <div style={{ width: '42px', height: '42px', background: 'rgba(168,85,247,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', marginBottom: '1rem' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Audit Trail & History</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Immutable activity logs tracking who modified tasks, toggled checklist items, and posted comments.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
