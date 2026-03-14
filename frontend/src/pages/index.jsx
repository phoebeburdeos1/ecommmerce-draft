import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '@/styles/home.module.scss';
import { fetchProducts } from '@/services/api';
import { productImageUrl } from '@/utils/image';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const FEATURED_COLLECTIONS = [
  {
    title: 'Summer Essentials',
    desc: 'Breezy styles for hot days.',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=450&fit=crop',
    href: '/products?category=Women',
  },
  {
    title: 'Office Wear',
    desc: 'Professional & comfortable.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=450&fit=crop',
    href: '/products?category=Men',
  },
  {
    title: 'Weekend Vibes',
    desc: 'Relaxed fits for downtime.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=450&fit=crop',
    href: '/products',
  },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await fetchProducts();
        const list = (data || []).slice(0, 4).map((p) => ({
          ...p,
          image: productImageUrl(p.image) || 'https://placehold.co/400x500?text=' + encodeURIComponent(p.name || ''),
          sizes: Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L', 'XL'],
        }));
        setTrending(list);
      } catch (e) {
        console.error('Failed to load products', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSizeChange = (productId, size) => {
    setSelectedSize((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to add items to your cart.');
      router.push('/auth/login');
      return;
    }
    const size = selectedSize[product.id];
    if (!size) {
      alert('Please select a size first.');
      return;
    }
    addItem(product, { size, quantity: 1 });
    alert(`Added ${product.name} (Size: ${size}) to cart.`);
  };

  return (
    <>
      <Head>
        <title>urbanNxt – Redefine Your Style</title>
      </Head>
      <div className={styles.homeContainer}>
        {/* Hero */}
        <section className={styles.heroBanner}>
          <img
            className={styles.heroBg}
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80"
            alt=""
          />
          <div className={styles.heroOverlay}>
            <h1>Redefine Your Style</h1>
            <p className={styles.heroDesc}>
              Discover the latest trends for the season. Elevate your wardrobe with our exclusive new collection.
            </p>
            <Link href="/products" className={styles.shopBtn}>
              Shop New Arrivals
            </Link>
          </div>
        </section>

        {/* Featured Collections */}
        <div className={styles.sectionHead}>
          <h2>Featured Collections</h2>
          <Link href="/products" className={styles.viewAll}>View All</Link>
        </div>
        <div className={styles.featuredGrid}>
          {FEATURED_COLLECTIONS.map((col) => (
            <Link key={col.title} href={col.href} className={styles.featuredCard}>
              <div className={styles.cardImgWrap}>
                <img src={col.image} alt={col.title} />
              </div>
              <div className={styles.cardBody}>
                <h3>{col.title}</h3>
                <p>{col.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Trending Now */}
        <div className={styles.trendingRow}>
          <h2>Trending Now</h2>
          <div className={styles.carouselArrows}>
            <button type="button" aria-label="Previous">‹</button>
            <button type="button" aria-label="Next">›</button>
          </div>
        </div>
        {loading ? (
          <p style={{ marginBottom: '2rem' }}>Loading…</p>
        ) : (
          <div className={styles.productGrid}>
            {trending.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.imgWrap}>
                  <Link href={`/product/${product.id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(e) => { e.target.src = 'https://placehold.co/400x500'; }}
                    />
                  </Link>
                  <button
                    type="button"
                    className={`${styles.wishBtn} ${isInWishlist(product.id) ? styles.active : ''}`}
                    onClick={() => (isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product.id))}
                    aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {isInWishlist(product.id) ? '♥' : '♡'}
                  </button>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.productTitle}>
                    <Link href={`/product/${product.id}`}>{product.name}</Link>
                  </h3>
                  <p className={styles.category}>{product.category}</p>
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
                  <p className={styles.price}>₱{Number(product.price).toFixed(2)}</p>
                  <button
                    type="button"
                    className={styles.addToCart}
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Join Our Community */}
        <section className={styles.communitySection}>
          <h3>Join Our Community</h3>
          <p className={styles.communityDesc}>
            Subscribe for exclusive updates, new arrivals, and insider-only discounts.
          </p>
          <form
            className={styles.subscribeForm}
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thanks for subscribing!');
            }}
          >
            <input type="email" placeholder="Enter your email address" required aria-label="Email" />
            <button type="submit">Subscribe</button>
          </form>
          <p className={styles.legalNote}>
            By subscribing, you agree to our Terms &amp; Privacy Policy.
          </p>
        </section>
      </div>
    </>
  );
}
