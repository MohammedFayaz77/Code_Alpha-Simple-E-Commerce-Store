import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, UserPlus, Lock, Mail, User, Briefcase, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleTitle, setRoleTitle] = useState('Event Producer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, password, roleTitle });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create Your Account</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Join the Fayaz EventFlow collaborative workspace.
          </p>
        </div>

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
                <User size={13} /> Full Name *
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Fayaz Ahmed"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={13} /> Email Address *
              </label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="fayaz@eventflow.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Briefcase size={13} /> Role / Professional Title
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Lead Technical Coordinator"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lock size={13} /> Password (min 6 characters) *
              </label>
              <input
                type="password"
                required
                minLength={6}
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
              <UserPlus size={16} /> {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
