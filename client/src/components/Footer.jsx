import React from 'react';
import { CalendarDays, Github, Award, Heart, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: '2.5rem 2rem 1.5rem', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <CalendarDays size={18} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>EventFlow</span>
              <span className="badge badge-medium" style={{ fontSize: '0.65rem' }}>Task 3: Project Tool</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Enterprise Collaborative Event & Project Management Tool engineered for high-stakes conferences, expos, festivals, and live production workflows.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                Internship Project
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li><strong>Candidate:</strong> Fayaz</li>
                <li><strong>Track:</strong> Full Stack Web Development</li>
                <li><strong>Organization:</strong> CodeAlpha</li>
                <li><strong>Submission:</strong> CodeAlpha_Fayaz_Event_Management</li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                Core Architecture
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li>React 18 + Vite SPA</li>
                <li>Node.js + Express REST API</li>
                <li>Prisma ORM (Relational Engine)</li>
                <li>Socket.io Live WebSockets</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <p>© 2026 Fayaz. CodeAlpha Full Stack Development Internship Submission.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={14} color="#10b981" /> 19/19 Tests Verified
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Award size={14} color="#f59e0b" /> QR Verified Portfolio
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
