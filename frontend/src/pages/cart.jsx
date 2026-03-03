import { useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/styles/cart.module.scss';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/router';
import { productImageUrl } from '@/utils/image';

export default function Cart() {
  const { user } = useAuth();
  const { items, updateItem, removeItem, subtotal } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleCheckout = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    router.push('/checkout');
  };

  return (
    <div className={styles.cartContainer}>
      <Head>
        <title>Shopping Cart - UrbanNext</title>
      </Head>

      <h1>Shopping Cart</h1>

      {items.length > 0 ? (
        <>
          <div className={styles.cartTable}>
            <table width="100%">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'center' }}>Size</th>
                  <th style={{ textAlign: 'center' }}>Price</th>
                  <th style={{ textAlign: 'center' }}>Quantity</th>
                  <th style={{ textAlign: 'center' }}>Subtotal</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.key}>
                    <td>
                      <div className={styles.productCell}>
                        <img
                          src={
                            productImageUrl(item.product.image) ||
                            'https://placehold.co/80x100?text=' +
                              encodeURIComponent(item.product.name || 'Item')
                          }
                          alt={item.product.name}
                          className={styles.productImage}
                          onError={(e) => { e.target.src = 'https://placehold.co/80x100'; }}
                        />
                        <div className={styles.productInfo}>
                          <h3>{item.product.name}</h3>
                          <p>{item.product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{item.size || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      ${Number(item.product.price || 0).toFixed(2)}
                    </td>
                    <td>
                      <div className={styles.quantityForm} style={{ justifyContent: 'center' }}>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.key, parseInt(e.target.value) || 1)
                          }
                        />
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                      ${(
                        Number(item.product.price || 0) * item.quantity
                      ).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.key)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.cartSummary}>
            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <strong>Free</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Tax</span>
                <strong>Calculated at checkout</strong>
              </div>
              <hr />
              <div className={styles.totalRow}>
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <button className={styles.checkoutBtn} onClick={handleCheckout}>
                Proceed to Checkout
              </button>
              <Link href="/products" className={styles.continueBtn}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.emptyCart}>
          <div className={styles.emptyIcon}>🛒</div>
          <p>Your cart is empty</p>
          <Link href="/products">
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
