import { useEffect, useState } from 'react';
import Link from 'next/link';
import SellerLayout from '@/components/seller/SellerLayout';
import {
  fetchSellerProducts,
  fetchSellerOrders,
} from '@/services/api';
import styles from '@/styles/sellerPortal.module.scss';

export default function SellerDashboardHome() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          fetchSellerProducts(),
          fetchSellerOrders(),
        ]);
        setProducts(productsRes.data.products || []);
        setOrders(ordersRes.data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const lowStockThreshold = 5;
  const lowStockProducts = products.filter((p) => (p.stock ?? 0) <= lowStockThreshold && (p.stock ?? 0) > 0);
  const outOfStock = products.filter((p) => (p.stock ?? 0) === 0);

  const totalEarnings = orders.reduce(
    (sum, o) => sum + (o.items || []).reduce((s, i) => s + (parseFloat(i.price) || 0) * (i.quantity || 1), 0),
    0
  );
  const recentOrders = orders.slice(0, 5);

  return (
    <SellerLayout>
      <div className={styles.breadcrumb}>
        <Link href="/dashboard/seller">Home</Link>
        <span> / Dashboard</span>
      </div>
      <h1 className={styles.pageTitle}>Welcome back</h1>
      <p className={styles.pageSubtitle}>Here is what&apos;s happening with your store today.</p>

      <div className={styles.actionRow}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/dashboard/seller/inventory" className={styles.primaryButton}>
            + Add Product
          </Link>
          <button type="button" className={styles.secondaryButton}>
            Request Payout
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>₱</div>
          <p className={styles.statValue}>₱{totalEarnings.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
          <p className={styles.statLabel}>Total Earnings</p>
          <span className={styles.statTrend}>+0% vs last month</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>📦</div>
          <p className={styles.statValue}>{orders.reduce((acc, o) => acc + (o.items || []).reduce((a, i) => a + (i.quantity || 1), 0), 0)}</p>
          <p className={styles.statLabel}>Items Sold</p>
          <span className={styles.statMeta}>Orders this month</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>★</div>
          <p className={styles.statValue}>4.9 ★★★★☆</p>
          <p className={styles.statLabel}>Store Rating</p>
          <span className={styles.statMeta}>Reviews</span>
        </div>
      </div>

      <div className={styles.twoColGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Recent Orders</h2>
            <Link href="/dashboard/seller/orders" className={styles.primaryButton} style={{ padding: '6px 14px', fontSize: 13 }}>
              View All
            </Link>
          </div>
          <div className={styles.cardBody}>
            {loading ? (
              <p className={styles.emptyState}>Loading...</p>
            ) : recentOrders.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>🛒</div>
                <p style={{ margin: 0 }}>No orders yet.</p>
                <p style={{ margin: '8px 0 0', fontSize: 14, color: '#94a3b8' }}>Orders will show up here when customers buy.</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const firstItem = order.items?.[0];
                    const orderTotal = (order.items || []).reduce((s, i) => s + (parseFloat(i.price) || 0) * (i.quantity || 1), 0);
                    return (
                      <tr key={order.id}>
                        <td>{firstItem?.product?.name || 'Order'} • Qty {(order.items || []).reduce((a, i) => a + (i.quantity || 1), 0)}</td>
                        <td>#{order.order_number || order.id}</td>
                        <td>
                          <span className={`${styles.badge} ${styles.blue}`}>{order.status || 'Pending'}</span>
                        </td>
                        <td>₱{orderTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Low Stock Alerts</h2>
            {lowStockProducts.length + outOfStock.length > 0 && (
              <span className={`${styles.badge} ${styles.red}`}>{lowStockProducts.length + outOfStock.length}</span>
            )}
          </div>
          <div className={styles.cardBody}>
            {loading ? (
              <p className={styles.emptyState}>Loading...</p>
            ) : lowStockProducts.length === 0 && outOfStock.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>✨</div>
                <p style={{ margin: 0 }}>All products are well stocked.</p>
                <p style={{ margin: '8px 0 0', fontSize: 14, color: '#94a3b8' }}>No low stock or out-of-stock items.</p>
              </div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {[...outOfStock, ...lowStockProducts].slice(0, 5).map((p) => (
                  <li key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <img
                      src={p.image || 'https://placehold.co/48x48?text=No+Image'}
                      alt=""
                      style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }}
                      onError={(e) => { e.target.src = 'https://placehold.co/48x48'; }}
                    />
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: 14 }}>{p.name}</strong>
                      <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
                        {p.stock === 0 ? (
                          <span style={{ color: '#dc2626' }}>Out of stock</span>
                        ) : (
                          <span style={{ color: '#d97706' }}>Only {p.stock} left</span>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {(lowStockProducts.length > 0 || outOfStock.length > 0) && (
              <Link href="/dashboard/seller/inventory" className={styles.primaryButton} style={{ display: 'inline-block', marginTop: 16, padding: '8px 16px', fontSize: 13 }}>
                Restock Items
              </Link>
            )}
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
