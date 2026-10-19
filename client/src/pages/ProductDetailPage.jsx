import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, ShoppingCart, Zap, ShieldCheck, Truck, ArrowLeft,
  Check, AlertCircle, RotateCcw, Package, Clock, Award
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetailPage({ onToast }) {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'specs' | 'shipping'
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await api.get(`/products/${identifier}`);
        if (res.success && res.data) {
          setProduct(res.data.product);
          setRelatedProducts(res.data.relatedProducts || []);
          setQuantity(1);
        }
      } catch (err) {
        console.error('Failed to fetch product details:', err);
        if (onToast) onToast('Product not found', 'danger');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [identifier]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      if (onToast) onToast('Please sign in to add products to your cart', 'info');
      navigate('/login');
      return;
    }

    try {
      setAdding(true);
      await addToCart(product.id, quantity);
      if (onToast) onToast(`Added ${quantity} × ${product.name} to cart!`, 'success');
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to add item', 'danger');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      if (onToast) onToast('Please sign in to proceed to checkout', 'info');
      navigate('/login');
      return;
    }

    try {
      setBuyingNow(true);
      navigate('/checkout', {
        state: {
          directItems: [
            {
              productId: product.id,
              quantity,
              product
            }
          ]
        }
      });
    } finally {
      setBuyingNow(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          <div className="skeleton" style={{ height: '450px', borderRadius: 'var(--radius-lg)' }} />
          <div>
            <div className="skeleton" style={{ height: '24px', width: '30%', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: '36px', width: '80%', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: '100px', marginBottom: '2rem' }} />
            <div className="skeleton" style={{ height: '48px', width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Product Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          The hardware item you requested is not listed or has been removed.
        </p>
        <Link to="/catalog" className="btn btn-primary">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const discountAmount = product.compareAtPrice && product.compareAtPrice > product.price
    ? (product.compareAtPrice - product.price).toFixed(2)
    : null;

  return (
    <div className="container">
      {/* Breadcrumb Navigation */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }} aria-label="Breadcrumb">
        <Link to="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <span>/</span>
        <Link to={`/catalog?category=${product.category?.slug}`} style={{ color: 'var(--text-secondary)' }}>
          {product.category?.name || 'Catalog'}
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{product.name}</span>
      </nav>

      {/* Main Details Grid */}
      <div className="product-details-grid" style={{ marginBottom: '4rem', alignItems: 'start' }}>
        {/* Product Media Column */}
        <div>
          <div className="card" style={{ padding: '1.5rem', background: '#ffffff', textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '100%', maxHeight: '460px', objectFit: 'contain', margin: '0 auto', borderRadius: 'var(--radius-md)' }}
            />
            {discountAmount && (
              <span className="product-discount-tag" style={{ top: '1.25rem', left: '1.25rem' }}>
                Save ${discountAmount}
              </span>
            )}
          </div>

          {/* Trust Value Badges Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.775rem', fontWeight: 600 }}>
              <ShieldCheck size={16} color="var(--primary)" /> 1-Year Warranty
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.775rem', fontWeight: 600 }}>
              <Truck size={16} color="var(--primary)" /> Fast Delivery
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.775rem', fontWeight: 600 }}>
              <RotateCcw size={16} color="var(--primary)" /> 30-Day Return
            </div>
          </div>
        </div>

        {/* Product Info & Purchase Column */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="badge badge-primary" style={{ width: 'fit-content', marginBottom: '0.75rem' }}>
            {product.category?.name}
          </div>

          <h1 style={{ fontSize: '2.1rem', marginBottom: '0.75rem', lineHeight: '1.25' }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#b45309' }}>
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{product.rating.toFixed(1)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                ({product.numReviews} Verified Reviews)
              </span>
            </div>
            {product.sku && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                SKU: {product.sku}
              </span>
            )}
          </div>

          {/* Pricing Block */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem', padding: '1.15rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice && (
              <>
                <span style={{ fontSize: '1.15rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ${product.compareAtPrice.toFixed(2)}
                </span>
                <span className="badge badge-success">
                  Save ${(product.compareAtPrice - product.price).toFixed(2)}
                </span>
              </>
            )}
          </div>

          {/* Stock Urgency Tag */}
          <div style={{ marginBottom: '1.5rem' }}>
            {product.stock === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontWeight: 600, fontSize: '0.9rem' }}>
                <AlertCircle size={17} /> Currently Out of Stock
              </div>
            ) : product.stock <= 5 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', fontWeight: 600, fontSize: '0.9rem' }}>
                <AlertCircle size={17} /> Only {product.stock} items remaining in stock - order soon!
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>
                <Check size={17} /> In Stock ({product.stock} units available for same-day dispatch)
              </div>
            )}
          </div>

          {/* Action Area: Quantity Stepper & Buy Buttons */}
          {product.stock > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Quantity:</label>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', background: '#fff', boxShadow: 'var(--shadow-xs)' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="btn btn-sm"
                    style={{ padding: '0.35rem 0.75rem' }}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span style={{ minWidth: '38px', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="btn btn-sm"
                    style={{ padding: '0.35rem 0.75rem' }}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1, minWidth: '170px' }}
                >
                  <ShoppingCart size={17} /> {adding ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={buyingNow}
                  className="btn btn-lg"
                  style={{ flex: 1, minWidth: '170px', background: '#090d16', color: '#ffffff' }}
                >
                  <Zap size={17} /> Buy Now
                </button>
              </div>
            </div>
          )}

          {/* Description Snippet */}
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.65', marginBottom: '1.5rem' }}>
            {product.description}
          </p>
        </div>
      </div>

      {/* Specifications & Guarantees Tabs */}
      <section className="card" style={{ marginBottom: '4rem', padding: '1.75rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.65rem 1rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              borderBottom: activeTab === 'overview' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            style={{
              padding: '0.65rem 1rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              borderBottom: activeTab === 'specs' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'specs' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            style={{
              padding: '0.65rem 1rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              borderBottom: activeTab === 'shipping' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'shipping' ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            Delivery & Warranty
          </button>
        </div>

        {activeTab === 'overview' && (
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
            <p style={{ marginBottom: '1rem' }}>{product.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Verified Authentic</div>
                <div style={{ fontSize: '0.85rem' }}>Sourced directly from authorized manufacturers and verified distributors.</div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Full Compatibility</div>
                <div style={{ fontSize: '0.85rem' }}>Engineered to modern enterprise and consumer operational standards.</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 600, color: 'var(--text-muted)', width: '220px' }}>Category</td>
                <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>{product.category?.name}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 600, color: 'var(--text-muted)' }}>Stock Keeping Unit (SKU)</td>
                <td style={{ padding: '0.75rem 0' }}>{product.sku || 'N/A'}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 600, color: 'var(--text-muted)' }}>Available Inventory</td>
                <td style={{ padding: '0.75rem 0' }}>{product.stock} units</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 600, color: 'var(--text-muted)' }}>Quality Rating</td>
                <td style={{ padding: '0.75rem 0' }}>{product.rating} / 5.0 ({product.numReviews} ratings)</td>
              </tr>
            </tbody>
          </table>
        )}

        {activeTab === 'shipping' && (
          <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
            <p style={{ marginBottom: '1rem' }}>
              Orders are packaged and dispatched within 24 hours of placement. Standard shipping takes 2-4 business days.
            </p>
            <p>
              Includes 30-day no-questions-asked refund policy. Returned products must include all original packaging and accessories.
            </p>
          </div>
        )}
      </section>

      {/* Related Products Recommendations */}
      {relatedProducts.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>
            Related Hardware in {product.category?.name}
          </h2>
          <div className="product-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onToast={onToast} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
