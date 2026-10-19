import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/api';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  ArrowRight,
  Users,
  CheckSquare
} from 'lucide-react';
import CreateProjectModal from '../components/CreateProjectModal';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getAll({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined
      });
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div className="main-content">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.25rem' }}>Event Projects</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Manage active conference, gala, festival, and corporate launch workspaces.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: 'var(--bg-card)',
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 280px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
              placeholder="Search projects by title, venue, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="Conference">Conference</option>
              <option value="Corporate Gala">Corporate Gala</option>
              <option value="Music Festival">Music Festival</option>
              <option value="Product Launch">Product Launch</option>
            </select>
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PLANNING">Planning</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <FolderKanban size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3>No projects found</h3>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            No projects matched your criteria. Launch a new project to get started.
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <Plus size={16} /> Create Event Project
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {projects.map((project) => {
            const stats = project.stats || {};
            return (
              <div
                key={project.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${project.color || '#6366f1'}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span className="badge badge-category">{project.category}</span>
                    <span className="badge badge-status">{project.status}</span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                    {project.title}
                  </h3>

                  {project.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {project.description}
                    </p>
                  )}

                  {/* Metadata Row: Date, Venue, Budget */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    {project.eventDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} color="#818cf8" />
                        <span>{new Date(project.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}

                    {project.venue && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} color="#f59e0b" />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.venue}</span>
                      </div>
                    )}

                    {project.budget > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <DollarSign size={14} color="#10b981" />
                        <span>Budget: ${project.budget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress & Team Footer */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckSquare size={13} /> {stats.completedTasks || 0} / {stats.totalTasks || 0} Tasks Done
                    </span>
                    <strong style={{ color: '#10b981' }}>{stats.progressPercentage || 0}%</strong>
                  </div>

                  <div className="subtask-progress-bar" style={{ marginBottom: '1rem' }}>
                    <div className="subtask-progress-fill" style={{ width: `${stats.progressPercentage || 0}%` }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Team Avatars Stack */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {(project.members || []).slice(0, 4).map((m, idx) => (
                        <div
                          key={m.id || idx}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: '#4f46e5',
                            border: '2px solid var(--bg-card)',
                            marginLeft: idx > 0 ? '-8px' : 0,
                            overflow: 'hidden',
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 700
                          }}
                          title={m.user?.name}
                        >
                          {m.user?.avatar ? (
                            <img src={m.user.avatar} alt={m.user.name} style={{ width: '100%', height: '100%' }} />
                          ) : (
                            m.user?.name?.charAt(0) || 'U'
                          )}
                        </div>
                      ))}
                      {(project.members?.length || 0) > 4 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                          +{project.members.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Open Board Action */}
                    <Link
                      to={`/projects/${project.id}/board`}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <span>Kanban Board</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={() => {
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}
