import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2, Printer, ArrowRight, Truck, Clock, Copy,
  Check, Package, ShoppingBag, ShieldCheck
} from 'lucide-react';
import api from '../services/api';

export default function OrderConfirmationPage({ onToast }) {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!order) {
      async function fetchOrder() {
        try {
          setLoading(true);
          const res = await api.get(`/orders/${orderNumber}`);
          if (res.success && res.data?.order) {
            setOrder(res.data.order);
          }
        } catch (err) {
          console.error('Failed to load order receipt:', err);
          if (onToast) onToast('Failed to load order details', 'danger');
        } finally {
          setLoading(false);
        }
      }
      fetchOrder();
    }
  }, [orderNumber, order]);

  const handlePrint = () => {
    window.print();
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    if (onToast) onToast('Order number copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.5rem auto' }} />
        <div className="skeleton" style={{ width: '300px', height: '30px', margin: '0 auto 1rem auto' }} />
        <div className="skeleton" style={{ width: '200px', height: '20px', margin: '0 auto' }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Order Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          We could not locate order <strong>{orderNumber}</strong>.
        </p>
        <Link to="/orders" className="btn btn-primary">
          View All Orders
        </Link>
      </div>
    );
  }

  const steps = [
    { title: 'Order Placed', desc: 'Received & authorized', active: true, done: true },
    { title: 'Processing', desc: 'Packing & preparing', active: order.status !== 'CANCELLED', done: order.status === 'SHIPPED' || order.status === 'DELIVERED' },
    { title: 'Shipped', desc: 'In courier transit', active: order.status === 'SHIPPED' || order.status === 'DELIVERED', done: order.status === 'DELIVERED' },
    { title: 'Delivered', desc: 'Completed package', active: order.status === 'DELIVERED', done: order.status === 'DELIVERED' }
  ];

  return (
    <div className="container" style={{ maxWidth: '880px' }}>
      {/* Confirmation Success Header */}
      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', marginBottom: '2rem', background: '#ffffff' }}>
        <div style={{ background: 'var(--success-bg)', width: '68px', height: '68px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', color: 'var(--success)', border: '1px solid var(--success-border)' }}>
          <CheckCircle2 size={38} />
        </div>

        <h1 style={{ fontSize: '2.1rem', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
          Thank You! Your Order is Confirmed
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.975rem' }}>
          Your payment has been authorized and our fulfillment hub has begun order preparation.
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-subtle)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: '0.95rem', border: '1px solid var(--border-light)' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Order Number:</span>
          <span style={{ color: 'var(--primary)' }}>{order.orderNumber}</span>
          <button
            onClick={copyOrderNumber}
            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
            title="Copy order number"
            aria-label="Copy order number"
          >
            {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Real-Time Milestone Timeline */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} color="var(--primary)" /> Real-Time Fulfillment Timeline
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
          {steps.map((st, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: st.active ? (st.done ? 'var(--primary)' : 'var(--primary-subtle)') : 'var(--bg-subtle)',
                color: st.active ? (st.done ? '#ffffff' : 'var(--primary)') : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                marginBottom: '0.5rem',
                border: st.active ? '2px solid var(--primary)' : '1px solid var(--border-light)'
              }}>
                {st.done ? <Check size={16} /> : (i + 1)}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: st.active ? 'var(--text-main)' : 'var(--text-muted)' }}>
                {st.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {st.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Printable Receipt */}
      <div className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Itemized Purchase Receipt</h2>
          <button onClick={handlePrint} className="btn btn-outline btn-sm">
            <Printer size={15} /> Print Invoice
          </button>
        </div>

        {/* Shipping & Payment Meta */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.75rem', fontSize: '0.875rem' }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>Shipping Address</div>
            <div style={{ color: 'var(--text-secondary)' }}>{order.recipientName}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{order.shippingAddress}</div>
            <div style={{ color: 'var(--text-secondary)' }}>{order.shippingCity}, {order.shippingPostalCode}</div>
            <div style={{ color: 'var(--text-secondary)' }}>Phone: {order.recipientPhone}</div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>Payment Status</div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Method: <strong>{order.paymentMethod}</strong>
            </div>
            <div>
              <span className={`badge ${order.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Line Items List */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Items Ordered</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {order.items?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.productName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Quantity: {item.quantity} × ${item.price.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Totals */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Estimated Taxes</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Express Shipping</span>
            <span>{order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}</span>
          </div>
          <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.35rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 800 }}>
            <span>Total Paid</span>
            <span style={{ color: 'var(--primary)' }}>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
        <Link to="/orders" className="btn btn-outline">
          <Package size={16} /> View Order History
        </Link>
        <Link to="/catalog" className="btn btn-primary">
          Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
