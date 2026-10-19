import React, { useState, useEffect } from 'react';
import {
  DollarSign, ShoppingBag, Package, Users, AlertTriangle, Plus, Edit2, Trash2,
  CheckCircle, Filter, RefreshCw, X, Search, CheckCircle2, TrendingUp, Sparkles
} from 'lucide-react';
import api from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';

export default function AdminDashboardPage({ onToast }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory'
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    stock: '',
    sku: '',
    image: '',
    categoryId: '1',
    isFeatured: false
  });

  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    loadAllAdminData();
  }, [orderStatusFilter]);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, productsRes, categoriesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get(`/admin/orders?status=${orderStatusFilter}`),
        api.get('/products?limit=50'),
        api.get('/categories')
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (ordersRes.success) setOrders(ordersRes.data.orders || []);
      if (productsRes.success) setProducts(productsRes.data.products || []);
      if (categoriesRes.success) setCategories(categoriesRes.data.categories || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      if (onToast) onToast('Failed to load admin data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.success) {
        if (onToast) onToast(`Order status updated to ${newStatus}`, 'success');
        loadAllAdminData();
      }
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to update order status', 'danger');
    }
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductFormData({
      name: '',
      description: '',
      price: '',
      compareAtPrice: '',
      stock: '12',
      sku: `SKU-${Date.now().toString().slice(-5)}`,
      image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
      categoryId: categories[0]?.id ? String(categories[0].id) : '1',
      isFeatured: false
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setProductFormData({
      name: prod.name,
      description: prod.description,
      price: String(prod.price),
      compareAtPrice: prod.compareAtPrice ? String(prod.compareAtPrice) : '',
      stock: String(prod.stock),
      sku: prod.sku || '',
      image: prod.image,
      categoryId: String(prod.categoryId),
      isFeatured: prod.isFeatured
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: productFormData.name,
        description: productFormData.description,
        price: parseFloat(productFormData.price),
        compareAtPrice: productFormData.compareAtPrice ? parseFloat(productFormData.compareAtPrice) : null,
        stock: parseInt(productFormData.stock, 10),
        sku: productFormData.sku,
        image: productFormData.image,
        categoryId: parseInt(productFormData.categoryId, 10),
        isFeatured: Boolean(productFormData.isFeatured)
      };

      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct.id}`, payload);
        if (res.success) {
          if (onToast) onToast('Product updated successfully', 'success');
        }
      } else {
        const res = await api.post('/products', payload);
        if (res.success) {
          if (onToast) onToast('Product created successfully', 'success');
        }
      }
      setIsProductModalOpen(false);
      loadAllAdminData();
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to save product', 'danger');
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const res = await api.delete(`/products/${productToDelete.id}`);
      if (res.success) {
        if (onToast) onToast('Product deleted from inventory', 'info');
        setProductToDelete(null);
        loadAllAdminData();
      }
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to delete product', 'danger');
    }
  };

  // Filtered orders by search
  const filteredOrders = orders.filter((ord) => {
    const q = orderSearchQuery.trim().toLowerCase();
    return !q ||
      ord.orderNumber.toLowerCase().includes(q) ||
      ord.recipientName.toLowerCase().includes(q) ||
      ord.user?.email.toLowerCase().includes(q);
  });

  // Filtered products by search
  const filteredProducts = products.filter((prod) => {
    const q = inventorySearchQuery.trim().toLowerCase();
    return !q ||
      prod.name.toLowerCase().includes(q) ||
      (prod.sku && prod.sku.toLowerCase().includes(q)) ||
      (prod.category?.name && prod.category.name.toLowerCase().includes(q));
  });

  return (
    <div className="container">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Sparkles size={14} /> Administrator Portal
          </div>
          <h1 style={{ fontSize: '2rem', marginTop: '0.2rem', marginBottom: '0.25rem' }}>Store Administration & KPIs</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Monitor revenue analytics, track customer shipments, and update catalog inventory
          </p>
        </div>
        <button onClick={loadAllAdminData} className="btn btn-outline btn-sm">
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Analytics KPI Metric Cards */}
      {stats && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrapper" style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Gross Revenue</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>${stats.metrics.totalRevenue.toFixed(2)}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)', border: '1px solid var(--primary-border)' }}>
              <ShoppingBag size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Total Orders</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{stats.metrics.totalOrders}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper" style={{ background: 'var(--info-bg)', color: 'var(--info)', border: '1px solid var(--info-border)' }}>
              <Package size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Hardware SKUs</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{stats.metrics.totalProducts}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrapper" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning-border)' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Customers</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{stats.metrics.totalUsers}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Selector Navigation */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1.75rem' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderBottom: activeTab === 'orders' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-secondary)'
          }}
        >
          Customer Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            borderBottom: activeTab === 'inventory' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'inventory' ? 'var(--primary)' : 'var(--text-secondary)'
          }}
        >
          Product & Inventory Catalog ({products.length})
        </button>
      </div>

      {/* TAB 1: ORDERS FULFILLMENT */}
      {activeTab === 'orders' && (
        <div>
          {/* Status Filter & Search Controls */}
          <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '0.25rem' }}>
                Status:
              </span>
              {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  className={`btn btn-sm ${orderStatusFilter === st ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setOrderStatusFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2rem', fontSize: '0.85rem', height: '2.1rem' }}
                placeholder="Search order # or recipient..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.85rem 1.15rem' }}>Order #</th>
                  <th style={{ padding: '0.85rem 1.15rem' }}>Recipient</th>
                  <th style={{ padding: '0.85rem 1.15rem' }}>Date</th>
                  <th style={{ padding: '0.85rem 1.15rem' }}>Items</th>
                  <th style={{ padding: '0.85rem 1.15rem' }}>Total</th>
                  <th style={{ padding: '0.85rem 1.15rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.15rem' }}>Update Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                      No orders found matching the filter query.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem 1.15rem', fontWeight: 700 }}>{ord.orderNumber}</td>
                      <td style={{ padding: '1rem 1.15rem' }}>
                        <div style={{ fontWeight: 600 }}>{ord.recipientName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.user?.email}</div>
                      </td>
                      <td style={{ padding: '1rem 1.15rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem 1.15rem' }}>
                        {ord.items.length} item{ord.items.length > 1 ? 's' : ''}
                      </td>
                      <td style={{ padding: '1rem 1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        ${ord.total.toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem 1.15rem' }}>
                        <span className={`badge ${
                          ord.status === 'DELIVERED' ? 'badge-success' :
                          ord.status === 'SHIPPED' ? 'badge-primary' :
                          ord.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.15rem' }}>
                        <select
                          className="form-select"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', height: '2rem' }}
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY CATALOG */}
      {activeTab === 'inventory' && (
        <div>
          <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2rem', fontSize: '0.85rem', height: '2.1rem' }}
                placeholder="Search product by title or SKU..."
                value={inventorySearchQuery}
                onChange={(e) => setInventorySearchQuery(e.target.value)}
              />
            </div>

            <button onClick={openAddProductModal} className="btn btn-primary btn-sm">
              <Plus size={16} /> Add New Product
            </button>
          </div>

          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.85rem 1.15rem' }}>Product Details</th>
                  <th style={{ padding: '0.85rem 1.15rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1.15rem' }}>SKU</th>
                  <th style={{ padding: '0.85rem 1.15rem' }}>Price</th>
                  <th style={{ padding: '0.85rem 1.15rem' }}>Stock Status</th>
                  <th style={{ padding: '0.85rem 1.15rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.85rem 1.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={p.image}
                          alt={p.name}
                          style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', background: '#f8fafc' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</div>
                          {p.isFeatured && (
                            <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.15rem', color: 'var(--text-secondary)' }}>
                      {p.category?.name || 'Electronics'}
                    </td>
                    <td style={{ padding: '1rem 1.15rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {p.sku || '-'}
                    </td>
                    <td style={{ padding: '1rem 1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      ${p.price.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem 1.15rem' }}>
                      <span className={`badge ${p.stock > 5 ? 'badge-success' : p.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                        {p.stock} in stock
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.15rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="btn btn-outline btn-sm btn-icon"
                          title="Edit Product"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          className="btn btn-outline btn-sm btn-icon"
                          style={{ color: 'var(--danger)' }}
                          title="Delete Product"
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProductModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                {editingProduct ? 'Edit Catalog Product' : 'Add New Catalog Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={productFormData.name}
                  onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={productFormData.categoryId}
                    onChange={(e) => setProductFormData({ ...productFormData, categoryId: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productFormData.sku}
                    onChange={(e) => setProductFormData({ ...productFormData, sku: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Compare At ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={productFormData.compareAtPrice}
                    onChange={(e) => setProductFormData({ ...productFormData, compareAtPrice: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Inventory Stock *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={productFormData.stock}
                    onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL *</label>
                <input
                  type="url"
                  className="form-input"
                  value={productFormData.image}
                  onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                  required
                />
              </div>

              {/* Real-time Image Thumbnail Preview */}
              {productFormData.image && (
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <img
                    src={productFormData.image}
                    alt="Preview"
                    style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Image thumbnail preview</div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={productFormData.isFeatured}
                    onChange={(e) => setProductFormData({ ...productFormData, isFeatured: e.target.checked })}
                  />
                  Display as Featured Product on Storefront
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsProductModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!productToDelete}
        title="Delete Catalog Product?"
        message={`Are you sure you want to permanently remove "${productToDelete?.name}" from your store catalog?`}
        confirmText="Delete Product"
        isDanger={true}
        onConfirm={handleDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}
