import { useEffect, useState } from 'react';
import Link from 'next/link';
import SellerLayout from '@/components/seller/SellerLayout';
import { fetchSellerOrders, updateSellerOrderStatus } from '@/services/api';
import styles from '@/styles/sellerPortal.module.scss';

const statusTabs = [
  { id: 'all', label: 'All Orders' },
  { id: 'pending', label: 'Pending' },
  { id: 'ready', label: 'Ready to Ship' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'returns', label: 'Returns' },
];

const refetch = (setOrders, setLoading) => {
  setLoading(true);
  return fetchSellerOrders()
    .then((res) => setOrders(res.data.orders || []))
    .catch(console.error)
    .finally(() => setLoading(false));
};

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    refetch(setOrders, setLoading);
  }, []);

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || getStatus(o) === statusFilter;
    const matchSearch = !search || (o.order_number || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleUpdateStatus = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    try {
      await updateSellerOrderStatus(orderId, status);
      await refetch(setOrders, setLoading);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatus = (o) => (o.status || '').toLowerCase();
  const pendingCount = orders.filter((o) => getStatus(o) === 'pending').length;
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.items || []).reduce((s, i) => s + (parseFloat(i.price) || 0) * (i.quantity || 1), 0),
    0
  );

  return (
    <SellerLayout>
      <div className={styles.breadcrumb}>
        <Link href="/dashboard/seller">Home</Link>
        <span> / Orders</span>
      </div>
      <div className={styles.actionRow}>
        <div>
          <h1 className={styles.pageTitle}>Manage My Orders</h1>
          <p className={styles.pageSubtitle}>Track pending shipments, update statuses, and print labels.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" className={styles.secondaryButton}>Export CSV</button>
          <button type="button" className={styles.primaryButton}>Batch Print</button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statValue}>{pendingCount}</p>
          <p className={styles.statLabel}>Pending Orders</p>
          <span className={styles.statMeta} style={{ color: '#dc2626' }}>Needs action</span>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statValue}>0</p>
          <p className={styles.statLabel}>Ready for Courier</p>
          <span className={styles.statMeta}>Awaiting pickup</span>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statValue}>0</p>
          <p className={styles.statLabel}>Shipped Today</p>
          <span className={styles.statTrend}>+0% vs yesterday</span>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statValue}>₱{totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
          <p className={styles.statLabel}>Total Revenue</p>
          <span className={styles.statMeta}>This week</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={statusFilter === tab.id ? styles.primaryButton : styles.secondaryButton}
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <input
        type="search"
        placeholder="Search orders..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', maxWidth: 320, padding: '10px 14px', marginBottom: 20, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
      />

      <div className={styles.card}>
        <div className={styles.cardBody} style={{ padding: 0 }}>
          {loading ? (
            <p className={styles.emptyState}>Loading...</p>
          ) : filtered.length === 0 ? (
            <p className={styles.emptyState}>No orders match your filters.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) =>
                  (order.items || []).map((item, idx) => (
                    <tr key={`${order.id}-${idx}`}>
                      <td>
                        <div>#{order.order_number || order.id}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{order.created_at ? new Date(order.created_at).toLocaleString() : ''}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={item.product?.image || 'https://placehold.co/48x48'}
                            alt=""
                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }}
                            onError={(e) => { e.target.src = 'https://placehold.co/48x48'; }}
                          />
                          <div>
                            <div style={{ fontWeight: 500 }}>{item.product?.name || 'Product'}</div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>Size / variant</div>
                          </div>
                        </div>
                      </td>
                      <td>{item.quantity || 1}</td>
                      <td>
                        <span className={`${styles.badge} ${styles.blue}`}>{order.status || 'Pending'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                          {idx === 0 && (
                            <>
                              {['pending', 'confirmed', 'processing'].includes(getStatus(order)) && (
                                <button
                                  type="button"
                                  className={styles.primaryButton}
                                  style={{ padding: '6px 12px', fontSize: 13 }}
                                  onClick={() => handleUpdateStatus(order.id, 'shipped')}
                                  disabled={updatingOrderId === order.id}
                                >
                                  {updatingOrderId === order.id ? '…' : 'Mark Shipped'}
                                </button>
                              )}
                              {getStatus(order) === 'shipped' && (
                                <button
                                  type="button"
                                  className={styles.primaryButton}
                                  style={{ padding: '6px 12px', fontSize: 13 }}
                                  onClick={() => handleUpdateStatus(order.id, 'delivered')}
                                  disabled={updatingOrderId === order.id}
                                >
                                  {updatingOrderId === order.id ? '…' : 'Mark Delivered'}
                                </button>
                              )}
                            </>
                          )}
                          <button type="button" className={styles.secondaryButton} style={{ padding: '6px 12px', fontSize: 13 }}>Print Label</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {filtered.length > 0 && (
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 16 }}>
          Showing 1–{Math.min(filtered.length, 10)} of {filtered.length} orders
        </p>
      )}
    </SellerLayout>
  );
}
