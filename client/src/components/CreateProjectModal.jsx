import React, { useState } from 'react';
import { projectService } from '../services/api';
import { X, Calendar, MapPin, DollarSign, Palette, FolderPlus } from 'lucide-react';

const COLOR_OPTIONS = [
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Sky', hex: '#0ea5e9' },
  { name: 'Violet', hex: '#8b5cf6' }
];

export default function CreateProjectModal({ onClose, onProjectCreated }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Conference');
  const [eventDate, setEventDate] = useState('');
  const [venue, setVenue] = useState('');
  const [budget, setBudget] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      const res = await projectService.create({
        title: title.trim(),
        category,
        eventDate: eventDate || null,
        venue: venue?.trim() || null,
        budget: budget ? parseFloat(budget) : 0,
        color,
        description: description?.trim() || null
      });

      if (res.data.success) {
        onProjectCreated(res.data.project);
        onClose();
      }
    } catch (err) {
      console.error('Failed to create project:', err);
      alert('Error creating event project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '620px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderPlus size={18} color={color} />
            <h3 style={{ fontSize: '1.15rem' }}>Create New Event Project</h3>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Event Project Title *</label>
              <input
                type="text"
                className="form-input"
                required
                autoFocus
                placeholder="e.g. Asia-Pacific AI Innovation Summit 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Event Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Conference">Tech & Business Conference</option>
                  <option value="Corporate Gala">Corporate Gala & Awards</option>
                  <option value="Music Festival">Music & Arts Festival</option>
                  <option value="Product Launch">Product Launch & Keynote</option>
                  <option value="Exhibition">Trade Expo & Exhibition</option>
                  <option value="Operations">Internal Operations</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} /> Target Event Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={13} /> Venue / Location
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Marina Bay Sands Expo Hall 3"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <DollarSign size={13} /> Total Budget ($)
                </label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 150000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </div>

            {/* Color Palette Selector */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Palette size={13} /> Project Accent Color
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: c.hex,
                      border: color === c.hex ? '3px solid #ffffff' : '2px solid transparent',
                      boxShadow: color === c.hex ? `0 0 10px ${c.hex}` : 'none',
                      cursor: 'pointer',
                      transition: 'transform 150ms'
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Project Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="High-level objectives, expected attendee scale, and key milestones..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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
              {loading ? 'Creating...' : 'Launch Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
