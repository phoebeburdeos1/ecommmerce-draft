import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/services/api';
import styles from '@/styles/checkout.module.scss';

export default function Checkout() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
    card_number: '',
    card_expiry: '',
    card_cvc: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'wallet' | 'cod'

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!items.length) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    try {
      const shippingAddress = `${form.first_name} ${form.last_name}
${form.address}
${form.city} ${form.postal_code}`.trim();

      await createOrder({
        total_amount: subtotal,
        shipping_address: shippingAddress,
        phone: form.phone,
        payment_method: paymentMethod,
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });
      clearCart();
      router.push('/dashboard/customer');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          'Failed to place order. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <Head>
        <title>Checkout - UrbanNext</title>
      </Head>

      <div className={styles.topBar}>
        <div>
          <div className={styles.crumbs}>
            Cart <span className={styles.dot}>/</span> Shipping{' '}
            <span className={styles.dot}>/</span> <span>Payment</span>
          </div>
          <h1 className={styles.title}>Checkout</h1>
          <p className={styles.subtitle}>Complete your order details below.</p>
        </div>
        <div className={styles.secure}>
          🔒 Secure checkout
        </div>
      </div>

      <div className={styles.layout}>
        {/* Left: details */}
        <div>
          <form onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}

            <section className={styles.sectionCard}>
              <h3>1. Shipping Address</h3>
              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label htmlFor="first_name">First Name</label>
                  <input
                    id="first_name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    id="last_name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="postal_code">Zip / Postal Code</label>
                  <input
                    id="postal_code"
                    name="postal_code"
                    value={form.postal_code}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </section>

            <section className={styles.sectionCard}>
              <h3>2. Payment Method</h3>
              <div className={styles.methodsTabs}>
                <button
                  type="button"
                  className={paymentMethod === 'card' ? 'active' : ''}
                  onClick={() => setPaymentMethod('card')}
                >
                  Credit Card
                </button>
                <button
                  type="button"
                  className={paymentMethod === 'wallet' ? 'active' : ''}
                  onClick={() => setPaymentMethod('wallet')}
                >
                  Digital Wallet
                </button>
                <button
                  type="button"
                  className={paymentMethod === 'cod' ? 'active' : ''}
                  onClick={() => setPaymentMethod('cod')}
                >
                  Cash on Delivery
                </button>
              </div>

              {paymentMethod === 'card' && (
                <>
                  <div className={styles.field}>
                    <label htmlFor="card_number">Card Number</label>
                    <input
                      id="card_number"
                      name="card_number"
                      value={form.card_number}
                      onChange={handleChange}
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>
                  <div className={styles.twoCol}>
                    <div className={styles.field}>
                      <label htmlFor="card_expiry">Expiry Date</label>
                      <input
                        id="card_expiry"
                        name="card_expiry"
                        value={form.card_expiry}
                        onChange={handleChange}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="card_cvc">CVC</label>
                      <input
                        id="card_cvc"
                        name="card_cvc"
                        value={form.card_cvc}
                        onChange={handleChange}
                        placeholder="123"
                      />
                    </div>
                  </div>
                </>
              )}
              {paymentMethod === 'wallet' && (
                <p className={styles.walletNote}>
                  You&apos;ll be redirected to your selected digital wallet to complete the payment.
                </p>
              )}
              {paymentMethod === 'cod' && (
                <p className={styles.walletNote}>
                  Pay in cash when your order is delivered. Please make sure your phone number and address are correct.
                </p>
              )}
            </section>

            <button
              type="submit"
              disabled={submitting}
              className={styles.payButton}
            >
              {submitting ? 'Placing order…' : `Pay ₱${subtotal.toFixed(2)} & Place Order`}
            </button>
            <div className={styles.secureNote}>
              🔒 Payments are secure and encrypted.
            </div>
          </form>
        </div>

        {/* Right: order summary */}
        <aside className={styles.orderSummary}>
          <h3 className={styles.summaryTitle}>Order Summary</h3>
          <div className={styles.itemsList}>
            {items.map((item) => (
              <div key={item.key} className={styles.itemRow}>
                <img
                  src={
                    item.product.image ||
                    'https://placehold.co/80x100?text=' +
                      encodeURIComponent(item.product.name || 'Item')
                  }
                  alt={item.product.name}
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/80x100';
                  }}
                />
                <div className={styles.itemInfo}>
                  <div className="name">{item.product.name}</div>
                  <div className="meta">
                    {item.size && `Size: ${item.size}`} {item.size && ' · '}
                    Qty: {item.quantity}
                  </div>
                </div>
                <div className={styles.price}>
                  ₱{Number(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Taxes</span>
            <span>₱0.00</span>
          </div>
          <div className={styles.totalRow}>
            <span className={styles.label}>Total</span>
            <span className={styles.amount}>₱{subtotal.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

