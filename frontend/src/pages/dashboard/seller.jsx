import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import axios from 'axios';
import styles from '@/styles/dashboard.module.scss';

export default function SellerDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { loading } = useProtectedRoute('seller');
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    if (user && user.role.name === 'seller') {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await axios.get('/seller/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setProductsLoading(false);
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
          <p className={styles.role}>Seller</p>
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
            className={`${styles.navItem} ${activeTab === 'products' ? styles.active : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 My Products
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'orders' ? styles.active : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            🛒 Orders
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'analytics' ? styles.active : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className={styles.mainContent}>
        {activeTab === 'overview' && (
          <div>
            <h1>Seller Dashboard</h1>
            <p>Welcome, {user.name}!</p>
            <div className={styles.stats}>
              <div className={styles.statCard}>
                <h3>{products.length}</h3>
                <p>Total Products</p>
              </div>
              <div className={styles.statCard}>
                <h3>0</h3>
                <p>Total Sales</p>
              </div>
              <div className={styles.statCard}>
                <h3>$0</h3>
                <p>Revenue</p>
              </div>
              <div className={styles.statCard}>
                <h3>0</h3>
                <p>Pending Orders</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className={styles.header}>
              <h1>My Products</h1>
              <button className={styles.primaryBtn}>+ Add Product</button>
            </div>
            {productsLoading ? (
              <p>Loading products...</p>
            ) : products.length > 0 ? (
              <div className={styles.productsGrid}>
                {products.map((product) => (
                  <div key={product.id} className={styles.productCard}>
                    <img src={product.image || '/placeholder.png'} alt={product.name} />
                    <h3>{product.name}</h3>
                    <p className={styles.price}>₱{parseFloat(product.price).toFixed(2)}</p>
                    <p className={styles.stock}>Stock: {product.stock}</p>
                    <div className={styles.actions}>
                      <button className={styles.secondaryBtn}>Edit</button>
                      <button className={styles.dangerBtn}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>No products yet. <a href="#" onClick={() => setActiveTab('products')}>Add your first product!</a></p>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h1>Orders from Customers</h1>
            <p className={styles.emptyState}>No orders yet.</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h1>Sales Analytics</h1>
            <p className={styles.emptyState}>Analytics coming soon...</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h1>Profile Settings</h1>
            <div className={styles.profileForm}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <p>{user.name}</p>
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <p>{user.email}</p>
              </div>
              <div className={styles.formGroup}>
                <label>Phone</label>
                <p>{user.phone || 'Not set'}</p>
              </div>
              <div className={styles.formGroup}>
                <label>Address</label>
                <p>{user.address || 'Not set'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
