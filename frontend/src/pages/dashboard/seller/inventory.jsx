import { useEffect, useState } from 'react';
import Link from 'next/link';
import SellerLayout from '@/components/seller/SellerLayout';
import {
  fetchSellerProducts,
  updateSellerProduct,
  fetchCategories,
  createSellerProduct,
  deleteSellerProduct,
} from '@/services/api';
import { productImageUrl } from '@/utils/image';
import styles from '@/styles/sellerPortal.module.scss';

const emptyProduct = { name: '', description: '', price: '', stock: '', category_id: '', image: '' };

export default function SellerInventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [productsRes, catRes] = await Promise.all([
        fetchSellerProducts(),
        fetchCategories().catch(() => ({ data: [] })),
      ]);
      const rawProducts = productsRes.data.products || [];
      setProducts(
        rawProducts.map((p) => ({
          ...p,
          image:
            productImageUrl(p.image) ||
            'https://placehold.co/56x56?text=' +
              encodeURIComponent(p.name || 'Product'),
        })),
      );
      setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || (filterStatus === 'live' && (p.stock ?? 0) > 0) || (filterStatus === 'out' && (p.stock ?? 0) === 0);
    const matchCat = filterCategory === 'all' || String(p.category_id) === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyProduct);
    setError('');
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      stock: String(p.stock),
      category_id: String(p.category_id || ''),
      image: p.image || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        category_id: parseInt(form.category_id, 10),
        image: form.image.trim() || null,
      };
      if (editingProduct) {
        await updateSellerProduct(editingProduct.id, payload);
      } else {
        await createSellerProduct(payload);
      }
      await load();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleStockChange = async (product, delta) => {
    const newStock = Math.max(0, (product.stock ?? 0) + delta);
    try {
      await updateSellerProduct(product.id, { stock: newStock });
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await deleteSellerProduct(p.id);
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (p) => {
    const stock = p.stock ?? 0;
    if (stock === 0) return { label: 'Out of Stock', className: styles.blue };
    if (stock <= 5) return { label: 'Low Stock', className: styles.orange };
    return { label: '• Live', className: styles.green };
  };

  return (
    <SellerLayout>
      <div className={styles.breadcrumb}>
        <Link href="/dashboard/seller">Home</Link>
        <span> / Inventory</span>
      </div>
      <div className={styles.actionRow}>
        <div>
          <h1 className={styles.pageTitle}>My Inventory</h1>
          <p className={styles.pageSubtitle}>Manage your products and stock levels.</p>
        </div>
        <button type="button" className={styles.primaryButton} onClick={openAdd}>
          + Quick Add Product
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
        >
          <option value="all">Status: All</option>
          <option value="live">Live</option>
          <option value="out">Out of Stock</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
        >
          <option value="all">Category: All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.card}>
        <div className={styles.cardBody} style={{ padding: 0 }}>
          {loading ? (
            <p className={styles.emptyState}>Loading...</p>
          ) : filteredProducts.length === 0 ? (
            <p className={styles.emptyState}>No products match. Add your first product above.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const status = getStatusBadge(p);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={p.image || 'https://placehold.co/56x56?text=No+Image'}
                            alt=""
                            style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }}
                            onError={(e) => { e.target.src = 'https://placehold.co/56x56'; }}
                          />
                          <div>
                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>SKU: {p.slug?.toUpperCase() || p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>₱{parseFloat(p.price).toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button type="button" onClick={() => handleStockChange(p, -1)} style={{ width: 32, height: 32, border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 16 }}>−</button>
                          <input
                            type="number"
                            min={0}
                            value={p.stock ?? 0}
                            readOnly
                            style={{ width: 56, textAlign: 'center', padding: 6, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
                          />
                          <button type="button" onClick={() => handleStockChange(p, 1)} style={{ width: 32, height: 32, border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 16 }}>+</button>
                        </div>
                        {(p.stock ?? 0) <= 5 && (p.stock ?? 0) > 0 && <div style={{ fontSize: 12, color: '#d97706', marginTop: 4 }}>Low Stock</div>}
                        {(p.stock ?? 0) === 0 && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>Out of Stock</div>}
                      </td>
                      <td><span className={`${styles.badge} ${status.className}`}>{status.label}</span></td>
                      <td>
                        <button type="button" className={styles.secondaryButton} style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => openEdit(p)}>Edit</button>
                        <button type="button" onClick={() => handleDelete(p)} style={{ marginLeft: 8, padding: '6px 12px', fontSize: 13, background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 480, width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 20 }}>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            {error && <p style={{ color: '#dc2626', marginBottom: 12, fontSize: 14 }}>{error}</p>}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Name *</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Product name" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Price (₱) *</label>
                <input type="number" step="0.01" min={0} required value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Stock *</label>
                <input type="number" min={0} required value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Category *</label>
                <select required value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }}>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Image URL</label>
                <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="https://..." style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className={styles.primaryButton} disabled={submitLoading}>{submitLoading ? 'Saving...' : 'Save'}</button>
                <button type="button" className={styles.secondaryButton} onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SellerLayout>
  );
}
