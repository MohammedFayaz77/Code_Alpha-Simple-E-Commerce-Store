import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter, Search, RotateCcw, ChevronLeft, ChevronRight,
  PackageOpen, X, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function CatalogPage({ onToast }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state from URL query
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Load categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get('/categories');
        if (res.success) {
          setCategories(res.data.categories || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Sync state if URL query params change
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setInStockOnly(searchParams.get('inStock') === 'true');
    setSortBy(searchParams.get('sort') || 'newest');
    setCurrentPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

  // Fetch products whenever filters or page changes
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (selectedCategory) params.set('categorySlug', selectedCategory);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (inStockOnly) params.set('inStock', 'true');
        if (sortBy) params.set('sort', sortBy);
        params.set('page', currentPage.toString());
        params.set('limit', '9');

        const res = await api.get(`/products?${params.toString()}`);
        if (res.success) {
          setProducts(res.data.products || []);
          setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        if (onToast) onToast('Failed to load products', 'danger');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [searchTerm, selectedCategory, minPrice, maxPrice, inStockOnly, sortBy, currentPage]);

  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === '' || value === false || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });
    // Always reset page to 1 when changing filters
    if (!('page' in newParams)) {
      params.delete('page');
      setCurrentPage(1);
    }
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSortBy('newest');
    setCurrentPage(1);
    setSearchParams(new URLSearchParams());
  };

  const applyPricePreset = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
    updateFilters({ minPrice: min, maxPrice: max });
  };

  const activeFiltersCount = [
    searchTerm,
    selectedCategory,
    minPrice || maxPrice,
    inStockOnly
  ].filter(Boolean).length;

  return (
    <div className="container">
      {/* Top Banner & Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Hardware & Tech Catalog</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Explore verified consumer and enterprise hardware with real-time stock availability
          </p>
        </div>

        {/* Mobile Filter Sheet Trigger Button */}
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="btn btn-outline btn-sm mobile-filter-btn"
          aria-label="Toggle filters"
        >
          <Filter size={15} /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>
      </div>

      {/* Active Filter Chips Bar */}
      {activeFiltersCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', padding: '0.65rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Active Filters:
          </span>

          {searchTerm && (
            <span className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => updateFilters({ search: '' })}>
              Search: "{searchTerm}" <X size={12} />
            </span>
          )}

          {selectedCategory && (
            <span className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => updateFilters({ category: '' })}>
              Category: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory} <X size={12} />
            </span>
          )}

          {(minPrice || maxPrice) && (
            <span className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => updateFilters({ minPrice: '', maxPrice: '' })}>
              Price: ${minPrice || '0'} - ${maxPrice || '∞'} <X size={12} />
            </span>
          )}

          {inStockOnly && (
            <span className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => updateFilters({ inStock: false })}>
              In-Stock Only <X size={12} />
            </span>
          )}

          <button
            onClick={handleResetFilters}
            style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <RotateCcw size={12} /> Clear all
          </button>
        </div>
      )}

      <div className="catalog-layout">
        {/* Filters Sidebar */}
        <aside className={`card catalog-sidebar ${mobileFilterOpen ? 'mobile-open' : ''}`} style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
              <Filter size={17} color="var(--primary)" /> Filters
              {activeFiltersCount > 0 && (
                <span className="badge badge-primary" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
                  title="Reset all filters"
                >
                  Reset
                </button>
              )}
              {mobileFilterOpen && (
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
                >
                  Done
                </button>
              )}
            </div>
          </div>


          {/* Search Field */}
          <div className="form-group">
            <label className="form-label">Search Keyword</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2rem', fontSize: '0.85rem' }}
                placeholder="Product title or specs..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  updateFilters({ search: e.target.value });
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    updateFilters({ search: '' });
                  }}
                  style={{ position: 'absolute', right: '8px', top: '10px', color: 'var(--text-muted)' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Categories List */}
          <div className="form-group">
            <label className="form-label">Hardware Categories</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <button
                onClick={() => updateFilters({ category: '' })}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.45rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: selectedCategory === '' ? 700 : 500,
                  backgroundColor: selectedCategory === '' ? 'var(--primary-subtle)' : 'transparent',
                  color: selectedCategory === '' ? 'var(--primary)' : 'var(--text-main)',
                  textAlign: 'left'
                }}
              >
                <span>All Categories</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pagination.total}</span>
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => updateFilters({ category: cat.slug })}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.45rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      fontWeight: isSelected ? 700 : 500,
                      backgroundColor: isSelected ? 'var(--primary-subtle)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      textAlign: 'left'
                    }}
                  >
                    <span>{cat.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat._count?.products || 0}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Presets & Inputs */}
          <div className="form-group">
            <label className="form-label">Price Range ($)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginBottom: '0.65rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem' }}
                onClick={() => applyPricePreset('0', '300')}
              >
                Under $300
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem' }}
                onClick={() => applyPricePreset('300', '800')}
              >
                $300 - $800
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem' }}
                onClick={() => applyPricePreset('800', '1500')}
              >
                $800 - $1.5k
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem' }}
                onClick={() => applyPricePreset('1500', '')}
              >
                $1.5k+
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min $"
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.5rem' }}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={() => updateFilters({ minPrice })}
              />
              <span style={{ color: 'var(--text-muted)' }}>-</span>
              <input
                type="number"
                placeholder="Max $"
                className="form-input"
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.5rem' }}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={() => updateFilters({ maxPrice })}
              />
            </div>
          </div>

          {/* In-Stock Toggle Switch */}
          <div className="form-group" style={{ marginBottom: 0, paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>In-Stock Only</span>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => {
                  setInStockOnly(e.target.checked);
                  updateFilters({ inStock: e.target.checked });
                }}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
              />
            </label>
          </div>
        </aside>

        {/* Main Products Area */}
        <div>
          {/* Sorting & Filter Results Controls Bar */}
          <div className="card" style={{ padding: '0.75rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Showing <strong>{products.length}</strong> of <strong>{pagination.total}</strong> products
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label htmlFor="sort-select" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ArrowUpDown size={14} /> Sort By:
              </label>
              <select
                id="sort-select"
                className="form-select"
                style={{ width: 'auto', padding: '0.35rem 1.85rem 0.35rem 0.65rem', fontSize: '0.85rem', height: '2.1rem' }}
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateFilters({ sort: e.target.value });
                }}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
                <option value="name-asc">Alphabetical (A - Z)</option>
              </select>
            </div>
          </div>

          {/* Product Grid Area */}
          {loading ? (
            <div className="product-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="card" style={{ height: '360px' }}>
                  <div className="skeleton" style={{ height: '190px', marginBottom: '1rem' }} />
                  <div className="skeleton" style={{ height: '20px', width: '45%', marginBottom: '0.5rem' }} />
                  <div className="skeleton" style={{ height: '24px', width: '80%', marginBottom: '1rem' }} />
                  <div className="skeleton" style={{ height: '38px' }} />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                <PackageOpen size={54} style={{ margin: '0 auto', opacity: 0.7 }} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Products Found</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
                No hardware items matched your current filter criteria. Try clearing search filters or widening your price bounds.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} onToast={onToast} />
                ))}
              </div>

              {/* Numbered Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => {
                      const prev = currentPage - 1;
                      setCurrentPage(prev);
                      updateFilters({ page: prev });
                    }}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={15} /> Prev
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      className={`btn btn-sm ${pageNum === currentPage ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        updateFilters({ page: pageNum });
                      }}
                      style={{ minWidth: '36px' }}
                      aria-current={pageNum === currentPage ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    className="btn btn-outline btn-sm"
                    disabled={!pagination.hasNextPage}
                    onClick={() => {
                      const next = currentPage + 1;
                      setCurrentPage(next);
                      updateFilters({ page: next });
                    }}
                    aria-label="Next page"
                  >
                    Next <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
