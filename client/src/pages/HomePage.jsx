import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, TrendingUp, Laptop, Smartphone, Headphones,
  Watch, Mouse, ShieldCheck, Truck, Clock, Star, CheckCircle, Code, Layers, Zap
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function HomePage({ onToast }) {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?isFeatured=true&limit=8')
        ]);

        if (catRes.success) {
          setCategories(catRes.data.categories || []);
        }
        if (prodRes.success) {
          setFeaturedProducts(prodRes.data.products || []);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'laptops-computers': return <Laptop size={22} />;
      case 'smartphones': return <Smartphone size={22} />;
      case 'audio-headphones': return <Headphones size={22} />;
      case 'wearables-smartwatches': return <Watch size={22} />;
      default: return <Mouse size={22} />;
    }
  };

  const filteredFeatured = activeCategoryFilter === 'all'
    ? featuredProducts
    : featuredProducts.filter(p => p.category?.slug === activeCategoryFilter);

  return (
    <div className="container">
      {/* Hero Showcase Banner */}
      <section className="hero-banner">
        <div className="hero-grid" style={{ alignItems: 'center' }}>
          <div className="hero-content">
            <div className="hero-pill">
              <Sparkles size={14} /> Full-Stack Internship Showcase • 2026 Collection
            </div>
            <h1 className="hero-title">
              Engineered For Power. Designed For Perfection.
            </h1>
            <p className="hero-subtitle">
              Discover flagship ultrabooks, smartphones, acoustic headphones, and developer accessories. Built with full-stack architectural precision.
            </p>
            <div className="hero-buttons">
              <Link to="/catalog" className="btn btn-primary btn-lg" style={{ background: '#ffffff', color: '#090d16', borderColor: '#ffffff' }}>
                Browse Storefront <ArrowRight size={17} />
              </Link>
              <Link to="/catalog?category=laptops-computers" className="btn btn-outline btn-lg" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)' }}>
                Shop Laptops
              </Link>
            </div>

            {/* Trust Micro-Metrics */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem', paddingTop: '1.75rem', borderTop: '1px solid rgba(255,255,255,0.12)', fontSize: '0.85rem', color: '#94a3b8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={16} color="#34d399" /> Free Express Shipping
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={16} color="#34d399" /> 1-Year Warranty
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={16} color="#34d399" /> 100% Authentic
              </div>
            </div>
          </div>

          {/* Hero Spotlight Teaser Card */}
          <div className="card" style={{ background: 'rgba(255, 255, 255, 0.07)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#ffffff', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="badge" style={{ background: 'rgba(37, 99, 235, 0.4)', color: '#93c5fd', border: '1px solid rgba(147, 197, 253, 0.3)' }}>
                Editor's Choice
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700 }}>
                <Star size={14} fill="#fbbf24" /> 4.9 (48 reviews)
              </div>
            </div>

            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '180px', marginBottom: '1.25rem', background: '#090d16' }}>
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
                alt="MacBook Air M2"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '0.35rem' }}>MacBook Air M2 13.6"</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.825rem', marginBottom: '1.25rem' }}>
              Apple M2 chip, 8-core CPU, 10-core GPU, 256GB SSD, MagSafe 3.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>$999.00</span>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through', marginLeft: '0.5rem' }}>$1,199.00</span>
              </div>
              <Link to="/products/macbook-air-m2" className="btn btn-sm" style={{ background: '#2563eb', color: '#fff' }}>
                View Spec <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Curated Categories</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Select a specialized hardware domain to inspect tailored specs
            </p>
          </div>
          <Link to="/catalog" className="btn btn-outline btn-sm">
            View All Categories <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              className="card card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '1.75rem 1.25rem',
                textDecoration: 'none'
              }}
            >
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                border: '1px solid var(--primary-border)'
              }}>
                {getCategoryIcon(cat.slug)}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.975rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                {cat.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {cat._count?.products || 0} Products Available
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products with Category Filters */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <TrendingUp size={15} /> Handpicked Deals
            </div>
            <h2 style={{ fontSize: '1.85rem', marginTop: '0.2rem' }}>Featured Hardware & Gear</h2>
          </div>

          {/* Quick Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`btn btn-sm ${activeCategoryFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            >
              All Flagships
            </button>
            {categories.slice(0, 3).map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategoryFilter(c.slug)}
                className={`btn btn-sm ${activeCategoryFilter === c.slug ? 'btn-primary' : 'btn-outline'}`}
              >
                {c.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="card" style={{ height: '360px' }}>
                <div className="skeleton" style={{ height: '190px', marginBottom: '1rem' }} />
                <div className="skeleton" style={{ height: '20px', width: '50%', marginBottom: '0.5rem' }} />
                <div className="skeleton" style={{ height: '24px', width: '85%', marginBottom: '1rem' }} />
                <div className="skeleton" style={{ height: '38px' }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {filteredFeatured.map((product) => (
              <ProductCard key={product.id} product={product} onToast={onToast} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Fayaz Store Value Pillars */}
      <section style={{ marginBottom: '4.5rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
          <h2 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>The Fayaz Store Advantage</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Engineered with industry-standard web principles to guarantee security, speed, and customer satisfaction.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Truck size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Express Logistics</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Complimentary expedited delivery on all orders exceeding $100 with end-to-end milestone timeline tracking.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Bank-Grade Security</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              JWT authenticated access, bcrypt password hashing, and encrypted order state management.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Clock size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>30-Day Guarantee</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Full refund or replacement on any defective electronics within 30 days of shipment arrival.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--info-bg)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Zap size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Atomic Real-Time Stock</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Database transactions prevent race conditions and synchronize inventory across multiple buyers in real time.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Credibility Banner */}
      <section className="card" style={{ background: '#090d16', color: '#ffffff', padding: '2.5rem', marginBottom: '2rem', border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(37, 99, 235, 0.3)', color: '#93c5fd', marginBottom: '0.5rem' }}>
              CodeAlpha Internship Full-Stack Submission
            </span>
            <h3 style={{ fontSize: '1.5rem', color: '#ffffff', marginTop: '0.35rem', marginBottom: '0.35rem' }}>
              Built With Modern Industry Technologies
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '580px' }}>
              Engineered by <strong>Fayaz</strong> using React 18, Vite, Express, Prisma ORM, and comprehensive RESTful endpoints.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: '#1e293b', color: '#e2e8f0', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>React 18</span>
            <span className="badge" style={{ background: '#1e293b', color: '#e2e8f0', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Vite 5</span>
            <span className="badge" style={{ background: '#1e293b', color: '#e2e8f0', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Node / Express</span>
            <span className="badge" style={{ background: '#1e293b', color: '#e2e8f0', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Prisma ORM</span>
            <span className="badge" style={{ background: '#1e293b', color: '#e2e8f0', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>JWT & RBAC</span>
          </div>
        </div>
      </section>
    </div>
  );
}
