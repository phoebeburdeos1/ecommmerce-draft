import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { fetchProduct, createConversation } from '@/services/api';
import { productImageUrl } from '@/utils/image';
import styles from '@/styles/products.module.scss';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [messageSellerLoading, setMessageSellerLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const { data } = await fetchProduct(id);
        const sizes = Array.isArray(data.sizes) ? data.sizes : ['S', 'M', 'L', 'XL'];
        setProduct({
          ...data,
          image: productImageUrl(data.image) || 'https://placehold.co/500x600?text=' + encodeURIComponent(data.name || 'Product'),
          sizes,
        });
      } catch (e) {
        if (e.response?.status === 404) setError('Product not found.');
        else setError('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to add items to your cart.');
      router.push('/auth/login');
      return;
    }
    if (!selectedSize) {
      alert('Please select a size.');
      return;
    }
    addItem(product, { size: selectedSize, quantity: 1 });
    alert(`Added ${product.name} (Size: ${selectedSize}) to cart.`);
  };

  const handleMessageSeller = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!product.seller_id) {
      alert('Seller information is not available for this product.');
      return;
    }
    setMessageSellerLoading(true);
    try {
      const { data } = await createConversation({
        other_user_id: product.seller_id,
        product_id: product.id,
      });
      router.push(`/messages?conversation=${data.conversation.id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Could not start conversation.');
    } finally {
      setMessageSellerLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.shopContainer}>
        <Head><title>Product - UrbanNext</title></Head>
        <p style={{ padding: '2rem' }}>Loading...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.shopContainer}>
        <Head><title>Product - UrbanNext</title></Head>
        <p style={{ padding: '2rem', color: '#b91c1c' }}>{error || 'Product not found.'}</p>
        <Link href="/products">Back to products</Link>
      </div>
    );
  }

  return (
    <div className={styles.shopContainer}>
      <Head>
        <title>{product.name} - UrbanNext</title>
      </Head>
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link> / <Link href="/products">Shop</Link> / <span>{product.name}</span>
      </div>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 32, display: 'flex', gap: 48, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 400px' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', maxWidth: 500, borderRadius: 8 }}
            onError={(e) => { e.target.src = 'https://placehold.co/500x600'; }}
          />
        </div>
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 28, margin: 0 }}>{product.name}</h1>
            <button
              type="button"
              onClick={() => (isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product.id))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24 }}
              aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isInWishlist(product.id) ? '♥' : '♡'}
            </button>
          </div>
          <p style={{ color: '#4a5568', marginBottom: 16 }}>{product.category}</p>
          <p style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>₱{Number(product.price).toFixed(2)}</p>
          <form onSubmit={handleAddToCart}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Size</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              required
              style={{ width: '100%', padding: 12, borderRadius: 6, border: '1px solid #cbd5e0', marginBottom: 16, fontSize: 14 }}
            >
              <option value="">Select Size</option>
              {(Array.isArray(product.sizes) ? product.sizes : ['S', 'M', 'L', 'XL']).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button type="submit" className={styles.addToCart} style={{ width: '100%' }}>
              Add to Cart
            </button>
          </form>
          {product.seller_id && user?.role?.name === 'customer' && (
            <button
              type="button"
              onClick={handleMessageSeller}
              disabled={messageSellerLoading}
              style={{
                width: '100%',
                marginTop: 12,
                padding: 12,
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                cursor: messageSellerLoading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {messageSellerLoading ? 'Opening...' : '💬 Message seller'}
            </button>
          )}
          <Link href="/products" style={{ display: 'inline-block', marginTop: 16, color: '#0b73ff' }}>
            ← Back to products
          </Link>
        </div>
      </div>
    </div>
  );
}
