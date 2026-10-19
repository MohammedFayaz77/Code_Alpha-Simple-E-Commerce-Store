import React, { useState, useEffect } from 'react';
import { projectService, authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, UserPlus, Shield, Trash2, Mail, UserCheck } from 'lucide-react';

export default function TeamModal({ project, onClose, onMembersUpdated }) {
  const { user } = useAuth();
  const [members, setMembers] = useState(project.members || []);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const isOwnerOrAdmin =
    project.ownerId === user.id ||
    members.some((m) => m.userId === user.id && ['OWNER', 'ADMIN'].includes(m.role));

  useEffect(() => {
    async function loadAllUsers() {
      try {
        const res = await authService.getAllUsers();
        if (res.data.success) {
          // Filter out users who are already members
          const existingIds = new Set(members.map((m) => m.userId));
          setAllUsers(res.data.users.filter((u) => !existingIds.has(u.id)));
        }
      } catch (err) {
        console.error('Failed to load users for invitation:', err);
      }
    }
    loadAllUsers();
  }, [members]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId && !inviteEmail.trim()) return;

    try {
      setLoading(true);
      const payload = selectedUserId
        ? { userId: parseInt(selectedUserId, 10), role: selectedRole }
        : { email: inviteEmail.trim(), role: selectedRole };

      const res = await projectService.addMember(project.id, payload);
      if (res.data.success) {
        const updated = [...members, res.data.member];
        setMembers(updated);
        setSelectedUserId('');
        setInviteEmail('');
        onMembersUpdated(updated);
      }
    } catch (err) {
      console.error('Failed to add member:', err);
      alert(err.response?.data?.message || 'Error adding member.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await projectService.updateMemberRole(project.id, userId, { role: newRole });
      if (res.data.success) {
        const updated = members.map((m) => (m.userId === userId ? res.data.member : m));
        setMembers(updated);
        onMembersUpdated(updated);
      }
    } catch (err) {
      console.error('Failed to update member role:', err);
      alert('Error updating role.');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await projectService.removeMember(project.id, userId);
      const updated = members.filter((m) => m.userId !== userId);
      setMembers(updated);
      onMembersUpdated(updated);
    } catch (err) {
      console.error('Failed to remove member:', err);
      alert(err.response?.data?.message || 'Error removing member.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '600px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} color="#6366f1" />
            <h3 style={{ fontSize: '1.15rem' }}>Project Team & Permissions</h3>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Add Team Member Section */}
          {isOwnerOrAdmin && (
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <UserPlus size={15} color="#818cf8" /> Add Team Member
              </h4>

              <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                  <select
                    className="form-select"
                    value={selectedUserId}
                    onChange={(e) => {
                      setSelectedUserId(e.target.value);
                      setInviteEmail('');
                    }}
                  >
                    <option value="">Select Existing Team Member...</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.roleTitle || u.email}
                      </option>
                    ))}
                  </select>

                  <select
                    className="form-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="MEMBER">Member (Full Tasks)</option>
                    <option value="ADMIN">Admin (Manage Team)</option>
                    <option value="VIEWER">Viewer (Read Only)</option>
                  </select>
                </div>

                {!selectedUserId && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Or enter email address..."
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  style={{ alignSelf: 'flex-end' }}
                  disabled={loading || (!selectedUserId && !inviteEmail.trim())}
                >
                  {loading ? 'Adding...' : 'Add to Project'}
                </button>
              </form>
            </div>
          )}

          {/* Members Roster */}
          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              Current Members ({members.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {members.map((m) => {
                const isProjectOwner = project.ownerId === m.userId;
                return (
                  <div
                    key={m.id || m.userId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="user-avatar" style={{ width: '34px', height: '34px' }}>
                        {m.user?.avatar ? (
                          <img src={m.user.avatar} alt={m.user.name} />
                        ) : (
                          m.user?.name?.charAt(0) || 'U'
                        )}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.user?.name}</span>
                          {isProjectOwner && (
                            <span className="badge badge-urgent" style={{ fontSize: '0.65rem' }}>
                              OWNER
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {m.user?.roleTitle || m.user?.email}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {isOwnerOrAdmin && !isProjectOwner ? (
                        <>
                          <select
                            className="form-select"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                            value={m.role}
                            onChange={(e) => handleUpdateRole(m.userId, e.target.value)}
                          >
                            <option value="ADMIN">Admin</option>
                            <option value="MEMBER">Member</option>
                            <option value="VIEWER">Viewer</option>
                          </select>

                          <button
                            onClick={() => handleRemoveMember(m.userId)}
                            className="btn-icon"
                            style={{ padding: '0.35rem', color: '#f87171' }}
                            title="Remove Member"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <span className="badge badge-status" style={{ fontSize: '0.75rem' }}>
                          {m.role}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
