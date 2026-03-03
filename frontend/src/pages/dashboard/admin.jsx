import { useEffect, useState } from 'react';
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

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.sidebar}>
        <div className={styles.userInfo}>
          <h3>{user.name}</h3>
          <p className={styles.role}>Admin</p>
          <p className={styles.email}>{user.email}</p>
        </div>

        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'products' ? styles.active : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 Products
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'orders' ? styles.active : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            🛒 Orders
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'reports' ? styles.active : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📈 Reports
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className={styles.mainContent}>
        {activeTab === 'overview' && (
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user.name}!</p>
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <h3>{stats.totalUsers || 0}</h3>
                <p>Total Users</p>
              </div>
              <div className={styles.statCard}>
                <h3>{stats.totalOrders || 0}</h3>
                <p>Total Orders</p>
              </div>
              <div className={styles.statCard}>
                <h3>₱{parseFloat(stats.totalRevenue || 0).toFixed(2)}</h3>
                <p>Total Revenue</p>
              </div>
              <div className={styles.statCard}>
                <h3>0</h3>
                <p>Pending Issues</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h1>User Management</h1>
            {dataLoading ? (
              <p>Loading users...</p>
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td><span className={styles.badge}>{u.role?.name || 'N/A'}</span></td>
                        <td>{u.phone || '-'}</td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td>
                          <button className={styles.smallBtn}>Edit</button>
                          <button className={styles.smallBtnDanger}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className={styles.emptyState}>No users found.</p>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <h1>Product Management</h1>
            <p className={styles.emptyState}>Product management coming soon...</p>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h1>Order Management</h1>
            <p className={styles.emptyState}>Order management coming soon...</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h1>Reports & Analytics</h1>
            <p className={styles.emptyState}>Reports coming soon...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h1>System Settings</h1>
            <div className={styles.settingsForm}>
              <div className={styles.formGroup}>
                <label>Site Name</label>
                <input type="text" defaultValue="Ecommerce Platform" />
              </div>
              <div className={styles.formGroup}>
                <label>Admin Email</label>
                <input type="email" defaultValue={user.email} />
              </div>
              <button className={styles.primaryBtn}>Save Settings</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
