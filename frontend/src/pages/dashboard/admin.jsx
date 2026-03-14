import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import axios from 'axios';
import styles from '@/styles/dashboard.module.scss';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { loading } = useProtectedRoute('admin');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (user && user.role.name === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      const response = await axios.get('/admin/stats');
      setStats(response.data.stats || {});

      const usersResponse = await axios.get('/admin/users');
      setUsers(usersResponse.data.users || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const totalSales = parseFloat(stats.totalRevenue || 0);
  const totalOrders = stats.totalOrders || 0;
  const totalUsers = stats.totalUsers || 0;

  return (
    <>
      <Head>
        <title>Admin Dashboard - urbanNxt</title>
      </Head>
      <div className={styles.dashboardPro}>
        <div className={styles.pageHeading}>
          <h1>
            {activeTab === 'overview'
              ? 'Overview'
              : activeTab === 'orders'
              ? 'Orders'
              : activeTab === 'products'
              ? 'Products'
              : activeTab === 'customers'
              ? 'Customers'
              : activeTab === 'analytics'
              ? 'Analytics'
              : 'Settings'}
          </h1>
          <p className={styles.subtitle}>
            {activeTab === 'overview' && "Welcome back, Admin. Here's what's happening today."}
            {activeTab === 'orders' && 'View and manage all customer orders in one place.'}
            {activeTab === 'products' && 'Manage your catalog, stock, and categories.'}
            {activeTab === 'customers' && 'See customer details, status, and value.'}
            {activeTab === 'analytics' && 'Overview of your store performance.'}
            {activeTab === 'settings' && 'Manage store preferences and system settings.'}
          </p>
        </div>

        <div className={styles.dashboardLayout}>
          <aside className={styles.sidebarPro}>
            <div className={styles.accountSection}>
              <div className={styles.sectionTitle}>Menu</div>
              <button
                type="button"
                className={`${styles.navItemPro} ${activeTab === 'overview' ? styles.active : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Dashboard
              </button>
              <button
                type="button"
                className={`${styles.navItemPro} ${activeTab === 'orders' ? styles.active : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                Orders
              </button>
              <button
                type="button"
                className={`${styles.navItemPro} ${activeTab === 'products' ? styles.active : ''}`}
                onClick={() => setActiveTab('products')}
              >
                Products
              </button>
              <button
                type="button"
                className={`${styles.navItemPro} ${activeTab === 'customers' ? styles.active : ''}`}
                onClick={() => setActiveTab('customers')}
              >
                Customers
              </button>
              <button
                type="button"
                className={`${styles.navItemPro} ${activeTab === 'analytics' ? styles.active : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                Analytics
              </button>
            </div>

            <div className={styles.filterSectionPro}>
              <div className={styles.sectionTitle}>System</div>
              <button
                type="button"
                className={`${styles.navItemPro} ${activeTab === 'settings' ? styles.active : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </div>

            <button
              type="button"
              className={styles.logoutBtn}
              onClick={handleLogout}
              style={{ marginTop: 16, width: '100%' }}
            >
              Logout
            </button>
          </aside>

          <div className={styles.mainPro}>
            {activeTab === 'overview' && (
              <>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <p className={styles.statValue}>₱{totalSales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                    <p className={styles.statLabel}>Total Sales</p>
                    <p className={styles.statMeta}>+0% vs last month</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className={styles.statValue}>{totalOrders}</p>
                    <p className={styles.statLabel}>New Orders</p>
                    <p className={styles.statMeta}>Last 30 days</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className={styles.statValue}>{totalUsers}</p>
                    <p className={styles.statLabel}>Total Customers</p>
                    <p className={styles.statMeta}>All time</p>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2>Sales Performance</h2>
                    <button type="button" className={styles.secondaryBtn}>
                      Last 30 Days
                    </button>
                  </div>
                  <div
                    className={styles.cardBody}
                    style={{
                      minHeight: 220,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9ca3af',
                    }}
                  >
                    Chart placeholder — connect your analytics data to show revenue over time.
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h2>Recent Orders</h2>
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.emptyState}>
                      Recent orders will appear here once your store starts receiving orders.
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'orders' && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Order Management</h2>
                  <div>
                    <button type="button" className={styles.secondaryBtn} style={{ marginRight: 8 }}>
                      Export CSV
                    </button>
                    <button type="button" className={styles.primaryBtn}>
                      + Add Order
                    </button>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.emptyState}>
                    Hook this table up to your orders API to see all orders, statuses, and totals.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Product Inventory</h2>
                  <button type="button" className={styles.primaryBtn}>
                    + Add New Product
                  </button>
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.emptyState}>
                    Use this section to manage products across all sellers (coming soon).
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Customers</h2>
                </div>
                <div className={styles.cardBody}>
                  {dataLoading ? (
                    <p>Loading customers...</p>
                  ) : users.length > 0 ? (
                    <div className={styles.usersTable}>
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Phone</th>
                            <th>Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr key={u.id}>
                              <td>{u.name}</td>
                              <td>{u.email}</td>
                              <td>
                                <span className={styles.badge}>{u.role?.name || 'N/A'}</span>
                              </td>
                              <td>{u.phone || '-'}</td>
                              <td>{new Date(u.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className={styles.emptyState}>No customers found.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Sales Analytics</h2>
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.emptyState}>
                    Analytics widgets (revenue over time, sales by category, top products) can be added here.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Store Settings</h2>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.settingsForm}>
                    <div className={styles.formGroup}>
                      <label>Store Name</label>
                      <input type="text" defaultValue="urbanNxt" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Support Email</label>
                      <input type="email" defaultValue={user.email} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Store Description</label>
                      <textarea rows={3} defaultValue="Premium urban clothing brand for the modern generation." />
                    </div>
                    <button type="button" className={styles.primaryBtn}>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
