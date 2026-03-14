import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  const getDashboardPath = () => {
    if (!user?.role?.name) return '/dashboard/customer';
    const role = user.role.name;
    if (role === 'customer') return '/dashboard/customer';
    if (role === 'seller') return '/dashboard/seller';
    if (role === 'admin') return '/dashboard/admin';
    return '/dashboard/customer';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/products');
  };

  const isAbout = router.pathname === '/about';
  const isHomeContact = router.pathname === '/' && router.asPath.includes('#contact');
  const isDashboard = router.pathname.startsWith('/dashboard');

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link href={user ? getDashboardPath() : '/'} className="brand">
          <span className="brand-n">N</span>
          <span className="brand-name">urbanNxt</span>
        </Link>
        {!user && (
          <button
            type="button"
            className="nav-toggle"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        )}
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {!user && (
            <>
              <Link
                href="/about"
                className={isAbout ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                About us
              </Link>
              <Link
                href="/#contact"
                className={isHomeContact ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                Contact us
              </Link>
            </>
          )}
        </nav>
        <div className="nav-center">
          <form className="nav-search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" aria-label="Search">🔍</button>
          </form>
          {user && isDashboard && (
            <div className="nav-breadcrumb">
              <Link href="/">Home</Link>
              <span> / </span>
              <strong>Dashboard</strong>
            </div>
          )}
        </div>
        <div className="nav-actions">
          {/* Cart should appear only for customers */}
          {user?.role?.name === 'customer' && (
            <Link href="/cart" aria-label="Cart" className="nav-cart">
              <span className="nav-cart-icon">🛒</span>
              {cartCount > 0 && <span className="nav-cart-count">{cartCount}</span>}
            </Link>
          )}
          {user ? (
            <>
              <Link href={getDashboardPath()} className="icon" aria-label="Account">👤</Link>
              <Link href="/messages" className="nav-messages" aria-label="Messages">
                💬
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/signup">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
