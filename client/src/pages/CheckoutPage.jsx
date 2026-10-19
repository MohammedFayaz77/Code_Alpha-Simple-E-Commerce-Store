import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, CreditCard, Banknote, Smartphone, CheckCircle,
  ArrowLeft, Lock, Check, AlertCircle, ShoppingBag
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function CheckoutPage({ onToast }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items: cartItems, summary: cartSummary, fetchCart } = useCart();

  // Check if checking out direct buy-now items or cart
  const directItems = location.state?.directItems;
  const isDirect = !!directItems && directItems.length > 0;

  const displayItems = isDirect ? directItems : cartItems;
  
  const directSubtotal = isDirect
    ? directItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
    : cartSummary.subtotal;

  const directTax = parseFloat((directSubtotal * 0.05).toFixed(2));
  const directShipping = directSubtotal > 100 ? 0 : 15.0;
  const directTotal = parseFloat((directSubtotal + directTax + directShipping).toFixed(2));

  // Form states
  const [formData, setFormData] = useState({
    recipientName: user?.name || '',
    recipientPhone: user?.phone || '+91 9876543210',
    shippingAddress: user?.address || '123 Tech Square, Phase 2',
    shippingCity: user?.city || 'Bengaluru',
    shippingPostalCode: user?.postalCode || '560001',
    shippingCountry: user?.country || 'India',
    paymentMethod: 'CARD'
  });

  const [cardData, setCardData] = useState({
    cardNumber: '4242 •••• •••• 4242',
    expiry: '12/28',
    cvv: '123',
    cardName: user?.name || 'Fayaz Customer'
  });

  const [upiId, setUpiId] = useState('customer@okaxis');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const errs = {};
    if (!formData.recipientName.trim()) errs.recipientName = 'Recipient full name is required';
    if (!formData.recipientPhone.trim()) errs.recipientPhone = 'Valid phone number is required';
    if (!formData.shippingAddress.trim()) errs.shippingAddress = 'Street address is required';
    if (!formData.shippingCity.trim()) errs.shippingCity = 'City name is required';
    if (!formData.shippingPostalCode.trim()) errs.shippingPostalCode = 'Postal / Zip code is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      if (onToast) onToast('Please complete all required delivery fields', 'danger');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingPostalCode: formData.shippingPostalCode,
        shippingCountry: formData.shippingCountry,
        paymentMethod: formData.paymentMethod,
        ...(isDirect && {
          directItems: directItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        })
      };

      const res = await api.post('/orders/checkout', payload);
      if (res.success && res.data?.order) {
        if (!isDirect) {
          await fetchCart();
        }
        if (onToast) onToast('Order placed successfully!', 'success');
        navigate(`/order-confirmation/${res.data.order.orderNumber}`, {
          state: { order: res.data.order }
        });
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      if (onToast) onToast(err.message || 'Checkout failed. Please try again.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (!displayItems || displayItems.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>No Items to Checkout</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Your shopping cart is currently empty.
        </p>
        <Link to="/catalog" className="btn btn-primary">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Top Header & Breadcrumb */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          <ArrowLeft size={15} /> Return to Shopping Cart
        </Link>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Checkout & Order Placement</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Confirm destination address and select test simulation payment
        </p>
      </div>

      <div className="checkout-layout" style={{ alignItems: 'start' }}>
        {/* Form Container */}
        <div>
          {/* Section 1: Shipping Address */}
          <div className="card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
              Delivery Destination
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Recipient Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                />
                {errors.recipientName && <span className="form-error"><AlertCircle size={12} /> {errors.recipientName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone Number *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.recipientPhone}
                  onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                />
                {errors.recipientPhone && <span className="form-error"><AlertCircle size={12} /> {errors.recipientPhone}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Apartment, building, street address..."
                value={formData.shippingAddress}
                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
              />
              {errors.shippingAddress && <span className="form-error"><AlertCircle size={12} /> {errors.shippingAddress}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.shippingCity}
                  onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                />
                {errors.shippingCity && <span className="form-error"><AlertCircle size={12} /> {errors.shippingCity}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Postal / PIN Code *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.shippingPostalCode}
                  onChange={(e) => setFormData({ ...formData, shippingPostalCode: e.target.value })}
                />
                {errors.shippingPostalCode && <span className="form-error"><AlertCircle size={12} /> {errors.shippingPostalCode}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.shippingCountry}
                  onChange={(e) => setFormData({ ...formData, shippingCountry: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
              Payment Method (Simulated Environment)
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div
                onClick={() => setFormData({ ...formData, paymentMethod: 'CARD' })}
                style={{
                  border: `2px solid ${formData.paymentMethod === 'CARD' ? 'var(--primary)' : 'var(--border-light)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.15rem 0.75rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: formData.paymentMethod === 'CARD' ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <CreditCard size={24} color={formData.paymentMethod === 'CARD' ? 'var(--primary)' : 'var(--text-secondary)'} style={{ margin: '0 auto 0.5rem auto' }} />
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Debit / Credit Card</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Test Simulation</div>
              </div>

              <div
                onClick={() => setFormData({ ...formData, paymentMethod: 'UPI' })}
                style={{
                  border: `2px solid ${formData.paymentMethod === 'UPI' ? 'var(--primary)' : 'var(--border-light)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.15rem 0.75rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: formData.paymentMethod === 'UPI' ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Smartphone size={24} color={formData.paymentMethod === 'UPI' ? 'var(--primary)' : 'var(--text-secondary)'} style={{ margin: '0 auto 0.5rem auto' }} />
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>UPI / Net Banking</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instant Virtual ID</div>
              </div>

              <div
                onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                style={{
                  border: `2px solid ${formData.paymentMethod === 'COD' ? 'var(--primary)' : 'var(--border-light)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.15rem 0.75rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: formData.paymentMethod === 'COD' ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Banknote size={24} color={formData.paymentMethod === 'COD' ? 'var(--primary)' : 'var(--text-secondary)'} style={{ margin: '0 auto 0.5rem auto' }} />
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Cash on Delivery</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pay at doorstep</div>
              </div>
            </div>

            {/* Test Payment Details Form */}
            {formData.paymentMethod === 'CARD' && (
              <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div className="form-group">
                  <label className="form-label">Simulated Card Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cardData.cardNumber}
                    readOnly
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Expiration Date</label>
                    <input type="text" className="form-input" value={cardData.expiry} readOnly />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">CVV Code</label>
                    <input type="text" className="form-input" value={cardData.cvv} readOnly />
                  </div>
                </div>
              </div>
            )}

            {formData.paymentMethod === 'UPI' && (
              <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="name@okaxis"
                  />
                </div>
              </div>
            )}

            {formData.paymentMethod === 'COD' && (
              <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Cash on delivery selected. You can inspect the package upon courier arrival and pay in cash.
              </div>
            )}
          </div>
        </div>

        {/* Order Review Sticky Sidebar */}
        <div className="card" style={{ position: 'sticky', top: '5.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
            Order Summary ({displayItems.length})
          </h2>

          <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', paddingRight: '0.5rem' }}>
            {displayItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  style={{ width: '46px', height: '46px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.product.name}
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    Qty: {item.quantity} × ${item.product.price.toFixed(2)}
                  </div>
                </div>
                <div style={{ fontWeight: 700 }}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${directSubtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Taxes (5%)</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${directTax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Express Shipping</span>
              <span style={{ fontWeight: 600, color: directShipping === 0 ? 'var(--success)' : 'var(--text-main)' }}>
                {directShipping === 0 ? 'FREE' : `$${directShipping.toFixed(2)}`}
              </span>
            </div>
            <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.3rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800 }}>
              <span>Order Total</span>
              <span style={{ color: 'var(--primary)' }}>${directTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {loading ? 'Processing Order...' : `Authorize & Place Order ($${directTotal.toFixed(2)})`}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} color="var(--success)" /> Verified CodeAlpha Test Environment
          </div>
        </div>
      </div>
    </div>
  );
}
