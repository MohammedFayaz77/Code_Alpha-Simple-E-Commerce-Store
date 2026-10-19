import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, LogIn, Lock, Mail, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, fastDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demoEmail) => {
    setError('');
    setLoading(true);
    try {
      await fastDemoLogin(demoEmail);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Demo login failed. Please ensure the database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}
          >
            <CalendarDays size={26} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome Back</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Sign in to access your Fayaz EventFlow project boards.
          </p>
        </div>

        {/* Login Card */}
        <div className="card">
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
                color: '#f87171',
                fontSize: '0.85rem',
                marginBottom: '1.25rem'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={13} /> Email Address
              </label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@eventflow.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lock size={13} /> Password
              </label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
              disabled={loading}
            >
              <LogIn size={16} /> {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Logins for Evaluator */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 700 }}>
              <Sparkles size={14} /> 1-CLICK DEMO EVALUATION PERSONAS
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleDemoClick('fayaz@eventflow.io')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.45rem' }}
              >
                👑 Fayaz (Lead)
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('sarah.chen@eventflow.io')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.45rem' }}
              >
                🎬 Sarah (AV Lead)
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('alex.morgan@eventflow.io')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.45rem' }}
              >
                🚚 Alex (Logistics)
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('priya.sharma@eventflow.io')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.45rem' }}
              >
                🥂 Priya (VIP)
              </button>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Register new account
          </Link>
        </p>
      </div>
    </div>
  );
}
