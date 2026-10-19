import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check, Eye, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product, onToast }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      if (onToast) onToast('Please sign in to add items to your cart', 'info');
      navigate('/login');
      return;
    }

    try {
      setAdding(true);
      await addToCart(product.id, 1);
      setAdded(true);
      if (onToast) onToast(`"${product.name}" added to cart!`, 'success');
      setTimeout(() => setAdded(false), 2200);
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to add item', 'danger');
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="product-card">
      <Link
        to={`/products/${product.slug || product.id}`}
        className="product-image-wrapper"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />

        {discountPercent ? (
          <span className="product-discount-tag">-{discountPercent}% OFF</span>
        ) : null}

        {product.stock <= 5 && product.stock > 0 && (
          <span
            style={{
              position: 'absolute',
              bottom: '0.65rem',
              left: '0.65rem',
              background: 'rgba(217, 119, 6, 0.92)',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              backdropFilter: 'blur(4px)'
            }}
          >
            Only {product.stock} left
          </span>
        )}
      </Link>

      <div className="product-info">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <span className="product-category-text">
            {product.category?.name || 'Electronics'}
          </span>

          <div className="product-rating" title={`${product.rating} out of 5 stars`}>
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{product.rating.toFixed(1)}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({product.numReviews})</span>
          </div>
        </div>

        <Link
          to={`/products/${product.slug || product.id}`}
          className="product-title"
          title={product.name}
        >
          {product.name}
        </Link>

        <div className="product-price-row">
          <span className="current-price">${product.price.toFixed(2)}</span>
          {product.compareAtPrice ? (
            <span className="original-price">${product.compareAtPrice.toFixed(2)}</span>
          ) : null}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className={`btn btn-sm ${added ? 'btn-secondary' : 'btn-primary'}`}
            style={{ flex: 1, padding: '0.45rem 0.75rem' }}
            aria-label={`Add ${product.name} to cart`}
          >
            {product.stock === 0 ? (
              'Out of Stock'
            ) : added ? (
              <>
                <Check size={15} color="var(--success)" /> Added
              </>
            ) : (
              <>
                <ShoppingCart size={15} /> {adding ? 'Adding...' : 'Add to Cart'}
              </>
            )}
          </button>

          <Link
            to={`/products/${product.slug || product.id}`}
            className="btn btn-outline btn-sm btn-icon"
            title="View Product Details"
            aria-label={`View details for ${product.name}`}
          >
            <Eye size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
