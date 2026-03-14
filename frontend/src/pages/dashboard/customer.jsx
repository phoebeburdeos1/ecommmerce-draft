import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { fetchCustomerOrders, fetchProducts, updateOrderStatus } from '@/services/api';
import { productImageUrl } from '@/utils/image';
import styles from '@/styles/dashboard.module.scss';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = [
  { name: 'Black', hex: '#111' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'White', hex: '#f3f4f6' },
  { name: 'Gray', hex: '#6b7280' },
  { name: 'Brown', hex: '#92400e' },
  { name: 'Red', hex: '#dc2626' },
];
const CATEGORIES = ['Men', 'Women', 'Kids'];

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { loading } = useProtectedRoute('customer');
  const { wishlistIds, removeFromWishlist, addToWishlist, isInWishlist } = useWishlist();
  const { addItem } = useCart();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSize, setFilterSize] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedSize, setSelectedSize] = useState({});

  useEffect(() => {
    if (user && user.role?.name === 'customer') {
      fetchOrders();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'wishlist' && wishlistIds.length > 0) {
      const load = async () => {
        setWishlistLoading(true);
        try {
          const { data } = await fetchProducts();
          const all = (data || []).map((p) => ({
            ...p,
            image: productImageUrl(p.image) || 'https://placehold.co/400x500?text=' + encodeURIComponent(p.name || ''),
          }));
          setWishlistProducts(all.filter((p) => wishlistIds.includes(p.id)));
        } catch (e) {
          console.error('Failed to load wishlist products', e);
        } finally {
          setWishlistLoading(false);
        }
      };
      load();
    } else if (activeTab === 'wishlist') {
      setWishlistProducts([]);
    }
  }, [activeTab, wishlistIds]);

  useEffect(() => {
    if (activeTab === 'overview') {
      const load = async () => {
        setProductsLoading(true);
        try {
          const { data } = await fetchProducts();
          setProducts(
            (data || []).map((p) => ({
              ...p,
              image: productImageUrl(p.image) || 'https://placehold.co/400x500?text=' + encodeURIComponent(p.name || ''),
              sizes: Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L', 'XL'],
            })),
          );
        } catch (e) {
          console.error('Failed to load products', e);
        } finally {
          setProductsLoading(false);
        }
      };
      load();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const { data } = await fetchCustomerOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  const getOrderStatus = (order) => (order.status || '').toLowerCase();

  const orderCounts = {
    all: orders.length,
    toShip: orders.filter((o) => ['pending', 'confirmed', 'processing'].includes(getOrderStatus(o))).length,
    toReceive: orders.filter((o) => getOrderStatus(o) === 'shipped').length,
    completed: orders.filter((o) => getOrderStatus(o) === 'delivered').length,
    cancelled: orders.filter((o) => getOrderStatus(o) === 'cancelled').length,
  };

  const filteredOrders = orders.filter((order) => {
    const s = getOrderStatus(order);
    if (orderFilter === 'all') return true;
    if (orderFilter === 'to-ship') return ['pending', 'confirmed', 'processing'].includes(s);
    if (orderFilter === 'to-receive') return s === 'shipped';
    if (orderFilter === 'completed') return s === 'delivered';
    if (orderFilter === 'cancelled') return s === 'cancelled';
    return true;
  });

  const [cancellingId, setCancellingId] = useState(null);
  const handleCancelOrder = async (order) => {
    const status = getOrderStatus(order);
    if (!['pending', 'confirmed', 'processing'].includes(status)) return;
    if (!confirm('Cancel this order? This cannot be undone.')) return;
    setCancellingId(order.id);
    try {
      await updateOrderStatus(order.id, 'cancelled');
      await fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  let filteredProducts = products;
  if (filterCategory) {
    filteredProducts = filteredProducts.filter((p) => p.category === filterCategory);
  }
  if (priceMin !== '') {
    const min = parseFloat(priceMin);
    if (!isNaN(min)) filteredProducts = filteredProducts.filter((p) => Number(p.price) >= min);
  }
  if (priceMax !== '') {
    const max = parseFloat(priceMax);
    if (!isNaN(max)) filteredProducts = filteredProducts.filter((p) => Number(p.price) <= max);
  }
  if (sortBy === 'price-asc') {
    filteredProducts = [...filteredProducts].sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortBy === 'price-desc') {
    filteredProducts = [...filteredProducts].sort((a, b) => Number(b.price) - Number(a.price));
  } else {
    filteredProducts = [...filteredProducts].sort((a, b) => (b.id || 0) - (a.id || 0));
  }

  const handleSizeChange = (productId, size) => {
    setSelectedSize((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    const size = selectedSize[product.id];
    if (!size) {
      alert('Please select a size first.');
      return;
    }
    addItem(product, { size, quantity: 1 });
    alert(`Added ${product.name} (Size: ${size}) to cart.`);
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
    <>
      <Head>
        <title>Dashboard - UrbanNxt</title>
      </Head>
      <div className={styles.dashboardPro}>
        <div className={styles.pageHeading}>
          <h1>
            {activeTab === 'overview' ? `Welcome back, ${user.name?.split(' ')[0] || 'there'}` : activeTab === 'orders' ? 'My Orders' : activeTab === 'wishlist' ? 'My Wishlist' : 'Profile Settings'}
          </h1>
          <p className={styles.subtitle}>
            {activeTab === 'overview' && 'Shop the latest collection.'}
            {activeTab === 'orders' && 'Track and manage your orders.'}
            {activeTab === 'wishlist' && 'Items you saved for later.'}
            {activeTab === 'profile' && 'Your account details.'}
          </p>
        </div>

        <div className={styles.dashboardLayout}>
          <aside className={styles.sidebarPro}>
            <div className={styles.accountSection}>
              <div className={styles.sectionTitle}>Account</div>
              <button
                type="button"
                className={`${styles.navItemPro} ${activeTab === 'overview' ? styles.active : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                type="button"
                className={`${styles.navItemPro} ${activeTab === 'orders' ? styles.active : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                My Orders
              </button>
              <button
                type="button"
                className={`${styles.navItemPro} ${activeTab === 'wishlist' ? styles.active : ''}`}
                onClick={() => setActiveTab('wishlist')}
              >
                Wishlist
              </button>
              <button
                type="button"
                className={`${styles.navItemPro} ${activeTab === 'profile' ? styles.active : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                Profile
              </button>
            </div>

            {activeTab === 'overview' && (
              <>
                <div className={styles.filterSectionPro}>
                  <div className={styles.sectionTitle}>Categories</div>
                  <div className={styles.categoryList}>
                    <label>
                      <input
                        type="radio"
                        name="cat"
                        checked={filterCategory === ''}
                        onChange={() => setFilterCategory('')}
                      />
                      All
                    </label>
                    {CATEGORIES.map((c) => (
                      <label key={c}>
                        <input
                          type="radio"
                          name="cat"
                          checked={filterCategory === c}
                          onChange={() => setFilterCategory(c)}
                        />
                        {c}
                      </label>
                    ))}
                  </div>
                </div>
                <div className={styles.filterSectionPro}>
                  <div className={styles.sectionTitle}>Size</div>
                  <select
                    value={filterSize}
                    onChange={(e) => setFilterSize(e.target.value)}
                    className={styles.sizeDropdown}
                  >
                    <option value="">All</option>
                    {SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.filterSectionPro}>
                  <div className={styles.sectionTitle}>Color</div>
                  <div className={styles.colorSwatches}>
                    {COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        className={`${styles.colorDot} ${filterColor === c.name ? styles.active : ''}`}
                        style={{ background: c.hex }}
                        title={c.name}
                        onClick={() => setFilterColor(filterColor === c.name ? '' : c.name)}
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.filterSectionPro}>
                  <div className={styles.sectionTitle}>Price</div>
                  <div className={styles.priceInputs}>
                    <input
                      type="number"
                      placeholder="0"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="500"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </>
            )}

            <button type="button" className={styles.logoutBtn} onClick={handleLogout} style={{ marginTop: 16, width: '100%' }}>
              Logout
            </button>
          </aside>

          <div className={styles.mainPro}>
            {activeTab === 'overview' && (
              <>
                <div className={styles.sortRowPro}>
                  <label htmlFor="sort">Sort by: </label>
                  <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="newest">Newest Arrivals</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
                {productsLoading ? (
                  <p>Loading products...</p>
                ) : (
                  <div className={styles.productGridPro}>
                    {filteredProducts.map((product, idx) => (
                      <div key={product.id} className={styles.productCardPro}>
                        <div className={styles.imageWrap}>
                          <Link href={`/product/${product.id}`}>
                            <img src={product.image} alt={product.name} onError={(e) => { e.target.src = 'https://placehold.co/400x500'; }} />
                          </Link>
                          {idx % 3 === 0 && <span className={styles.badgeNew}>NEW</span>}
                          {idx % 3 === 1 && <span className={styles.badgeSale}>-20%</span>}
                          <button
                            type="button"
                            className={`${styles.wishBtn} ${isInWishlist(product.id) ? styles.active : ''}`}
                            onClick={() => (isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product.id))}
                          >
                            {isInWishlist(product.id) ? '♥' : '♡'}
                          </button>
                        </div>
                        <div className={styles.cardBody}>
                          <Link href={`/product/${product.id}`}><h3 className={styles.cardTitle}>{product.name}</h3></Link>
                          <p className={styles.cardCategory}>{product.category}</p>
                          <label className={styles.sizeLabel}>Size</label>
                          <select
                            className={styles.sizeSelect}
                            value={selectedSize[product.id] || ''}
                            onChange={(e) => handleSizeChange(product.id, e.target.value)}
                          >
                            <option value="">Select Size</option>
                            {(Array.isArray(product.sizes) ? product.sizes : ['S', 'M', 'L', 'XL']).map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <div className={styles.priceRow}>
                            <span className={styles.price}>₱{Number(product.price).toFixed(2)}</span>
                            {idx % 3 === 1 && <span className={styles.oldPrice}>₱{(Number(product.price) * 1.25).toFixed(2)}</span>}
                          </div>
                          <button type="button" className={styles.primaryBtn} style={{ width: '100%', marginTop: 8 }} onClick={(e) => handleAddToCart(e, product)}>
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!productsLoading && filteredProducts.length === 0 && (
                  <p className={styles.emptyState}>No products match your filters. <Link href="/products">Browse all</Link></p>
                )}
              </>
            )}

            {activeTab === 'orders' && (
              <div className={styles.mainContent}>
                {ordersLoading ? (
                  <p>Loading orders...</p>
                ) : (
                  <>
                    <div className={styles.orderFilters}>
                      <button
                        type="button"
                        className={`${styles.orderFilterBtn} ${orderFilter === 'all' ? styles.active : ''}`}
                        onClick={() => setOrderFilter('all')}
                      >
                        <span className={styles.orderFilterLabel}>All</span>
                        <span className={styles.orderFilterCount}>{orderCounts.all}</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.orderFilterBtn} ${orderFilter === 'to-ship' ? styles.active : ''}`}
                        onClick={() => setOrderFilter('to-ship')}
                      >
                        <span className={styles.orderFilterLabel}>To Ship</span>
                        <span className={styles.orderFilterCount}>{orderCounts.toShip}</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.orderFilterBtn} ${orderFilter === 'to-receive' ? styles.active : ''}`}
                        onClick={() => setOrderFilter('to-receive')}
                      >
                        <span className={styles.orderFilterLabel}>To Receive</span>
                        <span className={styles.orderFilterCount}>{orderCounts.toReceive}</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.orderFilterBtn} ${orderFilter === 'completed' ? styles.active : ''}`}
                        onClick={() => setOrderFilter('completed')}
                      >
                        <span className={styles.orderFilterLabel}>Completed</span>
                        <span className={styles.orderFilterCount}>{orderCounts.completed}</span>
                      </button>
                      <button
                        type="button"
                        className={`${styles.orderFilterBtn} ${orderFilter === 'cancelled' ? styles.active : ''}`}
                        onClick={() => setOrderFilter('cancelled')}
                      >
                        <span className={styles.orderFilterLabel}>Cancelled</span>
                        <span className={styles.orderFilterCount}>{orderCounts.cancelled}</span>
                      </button>
                    </div>
                    {orders.length === 0 ? (
                      <p className={styles.emptyState}>
                        No orders yet. <Link href="/products">Start shopping!</Link>
                      </p>
                    ) : filteredOrders.length === 0 ? (
                      <p className={styles.emptyState}>
                        No orders in this status. Try a different filter.
                      </p>
                    ) : (
                      <div className={styles.ordersList}>
                        {filteredOrders.map((order) => {
                          const status = getOrderStatus(order);
                          const canCancel = ['pending', 'confirmed', 'processing'].includes(status);
                          const canMarkDelivered = status === 'shipped';
                          return (
                            <div key={order.id} className={styles.orderCard}>
                              <div className={styles.orderHeader}>
                                <h3>Order #{order.order_number}</h3>
                                <span className={`${styles.status} ${styles[status]}`}>{order.status}</span>
                              </div>
                              <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                              <p>Total: ₱{parseFloat(order.total_amount).toFixed(2)}</p>
                              <p>Payment Status: {order.payment_status}</p>
                              <div className={styles.orderActions}>
                                {canCancel && (
                                  <button
                                    type="button"
                                    className={styles.cancelOrderBtn}
                                    onClick={() => handleCancelOrder(order)}
                                    disabled={cancellingId === order.id}
                                  >
                                    {cancellingId === order.id ? 'Cancelling…' : 'Cancel order'}
                                  </button>
                                )}
                                {canMarkDelivered && (
                                  <button
                                    type="button"
                                    className={styles.primaryBtn}
                                    onClick={async () => {
                                      try {
                                        await updateOrderStatus(order.id, 'delivered');
                                        await fetchOrders();
                                      } catch (e) {
                                        alert(e.response?.data?.message || 'Failed to update.');
                                      }
                                    }}
                                  >
                                    I received it
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className={styles.mainContent}>
                {wishlistLoading ? (
                  <p>Loading wishlist...</p>
                ) : wishlistProducts.length > 0 ? (
                  <div className={styles.ordersList}>
                    {wishlistProducts.map((product) => (
                      <div key={product.id} className={styles.orderCard} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: 80, height: 100, objectFit: 'cover', borderRadius: 6 }}
                          onError={(e) => { e.target.src = 'https://placehold.co/80x100'; }}
                        />
                        <div style={{ flex: 1 }}>
                          <Link href={`/product/${product.id}`}><strong>{product.name}</strong></Link>
                          <p style={{ margin: '4px 0 0', color: '#4a5568' }}>₱{Number(product.price).toFixed(2)}</p>
                        </div>
                        <button type="button" onClick={() => removeFromWishlist(product.id)} className={styles.logoutBtn} style={{ padding: '8px 16px' }}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyState}>Your wishlist is empty. <Link href="/products">Browse products</Link></p>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className={styles.mainContent}>
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
      </div>
    </>
  );
}
