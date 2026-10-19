import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PackageCheck, ChevronRight, ShoppingBag, Eye, Calendar,
  CreditCard, Search, RotateCcw, Package
} from 'lucide-react';
import api from '../services/api';

export default function OrdersPage({ onToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        const res = await api.get('/orders');
        if (res.success && res.data) {
          setOrders(res.data.orders || []);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        if (onToast) onToast('Failed to load order history', 'danger');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="badge badge-success">Delivered</span>;
      case 'SHIPPED':
        return <span className="badge badge-primary">Shipped</span>;
      case 'PROCESSING':
        return <span className="badge badge-warning">Processing</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge badge-warning">Pending</span>;
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = statusFilter === 'ALL' || ord.status === statusFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      ord.orderNumber.toLowerCase().includes(query) ||
      ord.items.some(i => i.productName.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 0', maxWidth: '960px' }}>
        <div className="skeleton" style={{ height: '35px', width: '250px', marginBottom: '2rem' }} />
        {[1, 2, 3].map((n) => (
          <div key={n} className="card" style={{ height: '140px', marginBottom: '1rem' }}>
            <div className="skeleton" style={{ height: '100%' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '960px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>My Order History</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Follow shipment transit, inspect receipts, and review past hardware orders
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2rem', fontSize: '0.85rem', height: '2.1rem' }}
            placeholder="Search order # or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ background: 'var(--bg-subtle)', width: '68px', height: '68px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', color: 'var(--text-muted)' }}>
            <Package size={34} />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Orders Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {orders.length === 0
              ? 'You have not placed any orders yet. Explore our hardware catalog to get started.'
              : 'No orders match your search and filter criteria.'}
          </p>
          <Link to="/catalog" className="btn btn-primary btn-sm">
            Browse Storefront
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredOrders.map((order) => (
            <div key={order.id} className="card card-hover" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>{order.orderNumber}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={13} /> {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CreditCard size={13} /> {order.paymentMethod} ({order.paymentStatus})
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    ${order.total.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Items Thumbnails Preview */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflowX: 'auto' }}>
                  {order.items.map((item, idx) => (
                    <img
                      key={idx}
                      src={item.productImage}
                      alt={item.productName}
                      title={`${item.productName} (Qty: ${item.quantity})`}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', background: '#f8fafc' }}
                    />
                  ))}
                </div>

                <Link to={`/order-confirmation/${order.orderNumber}`} className="btn btn-outline btn-sm">
                  <Eye size={14} /> View Invoice & Tracking
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
