import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Briefcase, FileText, Image, Shield, CheckCircle, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [roleTitle, setRoleTitle] = useState(user?.roleTitle || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      await updateProfile({
        name,
        roleTitle,
        bio,
        avatar
      });
      setSuccessMsg('Profile details successfully updated!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>User Profile & Settings</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Manage your identity and team role in the Fayaz EventFlow system.
        </p>
      </div>

      <div className="card">
        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#34d399',
              fontSize: '0.85rem',
              marginBottom: '1.5rem'
            }}
          >
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Avatar preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div
              className="user-avatar"
              style={{ width: '64px', height: '64px', fontSize: '1.5rem', boxShadow: 'var(--shadow-md)' }}
            >
              {avatar ? <img src={avatar} alt={name} /> : name.charAt(0)}
            </div>

            <div>
              <h3 style={{ fontSize: '1.15rem' }}>{user?.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem' }}>
                <Shield size={13} color="#818cf8" />
                <span className="badge badge-medium" style={{ fontSize: '0.65rem' }}>
                  System Role: {user?.systemRole}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={13} /> Full Name
              </label>
              <input
                type="text"
                required
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Briefcase size={13} /> Role Title
              </label>
              <input
                type="text"
                className="form-input"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Image size={13} /> Avatar Image URL
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/..."
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <FileText size={13} /> Bio / Professional Background
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief overview of your production specialty and responsibilities..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
