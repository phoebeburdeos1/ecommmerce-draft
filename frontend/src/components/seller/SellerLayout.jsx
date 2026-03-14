import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { fetchConversationsUnreadCount } from '@/services/api';
import styles from '@/styles/sellerPortal.module.scss';

const navItems = [
  { href: '/dashboard/seller', label: 'Dashboard', icon: '▦' },
  { href: '/dashboard/seller/inventory', label: 'My Inventory', icon: '▤' },
  { href: '/dashboard/seller/orders', label: 'Manage Orders', icon: '🛒' },
  { href: '/dashboard/seller/analytics', label: 'Analytics', icon: '▥' },
  { href: '/dashboard/seller/settings', label: 'Settings', icon: '⚙' },
  { href: '/dashboard/seller/payouts', label: 'Payouts', icon: '₱' },
];

export default function SellerLayout({ children }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  useProtectedRoute('seller');

  useEffect(() => {
    if (!user) return;
    fetchConversationsUnreadCount()
      .then((res) => setUnreadCount(res.data?.unread_count ?? 0))
      .catch(() => {});
  }, [user, router.pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (!user) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.portal}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo}>urbanNxt</span>
          <span className={styles.portalLabel}>Seller Portal</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard/seller'
              ? router.pathname === '/dashboard/seller'
              : router.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/messages" className={styles.navItem}>
          <span className={styles.navIcon}>💬</span>
          Messages
          {unreadCount > 0 && (
            <span className={styles.messageBadge} aria-label={`${unreadCount} unread`}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
        <div className={styles.sidebarFooter}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>{user.name?.charAt(0)?.toUpperCase() || 'S'}</div>
            <div className={styles.userMeta}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.storeName}>Seller</span>
            </div>
          </div>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
