import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2, ArrowRight, ShoppingBag, ArrowLeft, ShieldCheck,
  Truck, Tag, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import ConfirmationModal from '../components/ConfirmationModal';

export default function CartPage({ onToast }) {
  const { items, summary, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);

  const freeShippingThreshold = 100.0;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - summary.subtotal);
  const progressPercent = Math.min(100, Math.round((summary.subtotal / freeShippingThreshold) * 100));

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'CODEALPHA') {
      setPromoApplied(true);
      if (onToast) onToast('Coupon CODEALPHA applied! (10% discount applied)', 'success');
    } else {
      if (onToast) onToast('Invalid coupon code. Try "CODEALPHA"', 'danger');
    }
  };

  const discountAmount = promoApplied ? (summary.subtotal * 0.1) : 0;
  const finalTotal = Math.max(0, summary.total - discountAmount);

  if (items.length === 0 && !loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div style={{ background: 'var(--primary-subtle)', width: '80px', height: '80px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--primary)' }}>
          <ShoppingBag size={38} />
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Your Shopping Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '440px', margin: '0 auto 2rem auto', fontSize: '0.95rem' }}>
          Explore our premier hardware catalog to discover and add high-performance electronics to your cart.
        </p>
        <Link to="/catalog" className="btn btn-primary btn-lg">
          Explore Catalog <ArrowRight size={17} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Shopping Cart</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Review your selected tech hardware before proceeding to secure checkout
          </p>
        </div>
        <button
          onClick={() => setShowClearModal(true)}
          className="btn btn-outline btn-sm"
          style={{ color: 'var(--danger)', borderColor: 'var(--border-light)' }}
        >
          <Trash2 size={14} /> Clear Cart
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.75rem', background: '#ffffff', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <Truck size={17} color="var(--primary)" />
            {amountToFreeShipping === 0 ? (
              <span style={{ color: 'var(--success)' }}>🎉 Congratulations! You have unlocked FREE Express Delivery!</span>
            ) : (
              <span>Add <strong>${amountToFreeShipping.toFixed(2)}</strong> more to unlock <strong>FREE Express Shipping</strong></span>
            )}
          </div>
          <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{progressPercent}%</span>
        </div>
        <div style={{ width: '100%', height: '7px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: amountToFreeShipping === 0 ? 'var(--success)' : 'var(--primary)',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      <div className="cart-layout" style={{ alignItems: 'start' }}>
        {/* Cart Line Items Table Card */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-subtle)', fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Cart Items ({summary.itemCount})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid var(--border-light)'
                }}
              >
                <Link to={`/products/${item.product.slug || item.product.id}`}>
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    style={{ width: '74px', height: '74px', objectFit: 'cover', borderRadius: 'var(--radius-md)', background: '#f8fafc' }}
                  />
                </Link>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                    {item.product.category?.name || 'Hardware'}
                  </div>
                  <Link
                    to={`/products/${item.product.slug || item.product.id}`}
                    style={{ fontWeight: 700, fontSize: '0.975rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}
                  >
                    {item.product.name}
                  </Link>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    ${item.product.price.toFixed(2)} each
                  </div>
                </div>

                {/* Quantity Controls Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', background: '#ffffff' }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="btn btn-sm"
                    style={{ padding: '0.25rem 0.65rem' }}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="btn btn-sm"
                    style={{ padding: '0.25rem 0.65rem' }}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Line Total */}
                <div style={{ width: '90px', textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>

                {/* Trash Item Button */}
                <button
                  onClick={() => setItemToDelete(item)}
                  className="btn btn-icon btn-sm"
                  style={{ color: 'var(--text-muted)' }}
                  title="Remove item"
                  aria-label={`Remove ${item.product.name} from cart`}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between' }}>
            <Link to="/catalog" className="btn btn-outline btn-sm">
              <ArrowLeft size={15} /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="card" style={{ position: 'sticky', top: '5.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
            Order Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${summary.subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Estimated Tax (5%)</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>${summary.tax.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Shipping Fee</span>
              <span style={{ fontWeight: 600, color: summary.shippingFee === 0 ? 'var(--success)' : 'var(--text-main)' }}>
                {summary.shippingFee === 0 ? 'FREE' : `$${summary.shippingFee.toFixed(2)}`}
              </span>
            </div>

            {promoApplied && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)', fontWeight: 600 }}>
                <span>CodeAlpha Promo (-10%)</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.35rem 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800 }}>
              <span>Estimated Total</span>
              <span style={{ color: 'var(--primary)' }}>${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Promo Code Input Card */}
          <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input
              type="text"
              placeholder="Promo code (CODEALPHA)"
              className="form-input"
              style={{ fontSize: '0.85rem' }}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              Apply
            </button>
          </form>

          {/* Checkout CTA */}
          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: '0.85rem' }}
          >
            Proceed to Checkout <ArrowRight size={17} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={15} color="var(--success)" /> 256-bit Encrypted Checkout
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={!!itemToDelete}
        title="Remove Item from Cart?"
        message={`Are you sure you want to remove "${itemToDelete?.product?.name}" from your shopping cart?`}
        confirmText="Remove Item"
        isDanger={true}
        onConfirm={async () => {
          if (itemToDelete) {
            await removeFromCart(itemToDelete.id);
            if (onToast) onToast('Item removed from cart', 'info');
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />

      <ConfirmationModal
        isOpen={showClearModal}
        title="Clear Entire Cart?"
        message="Are you sure you want to remove all items from your shopping cart? This action cannot be reversed."
        confirmText="Clear Cart"
        isDanger={true}
        onConfirm={async () => {
          await clearCart();
          if (onToast) onToast('Shopping cart cleared', 'info');
          setShowClearModal(false);
        }}
        onCancel={() => setShowClearModal(false)}
      />
    </div>
  );
}
