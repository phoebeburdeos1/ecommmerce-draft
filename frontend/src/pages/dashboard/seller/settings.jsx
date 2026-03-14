import Link from 'next/link';
import SellerLayout from '@/components/seller/SellerLayout';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/sellerPortal.module.scss';

export default function SellerSettings() {
  const { user } = useAuth();

  return (
    <SellerLayout>
      <div className={styles.breadcrumb}>
        <Link href="/dashboard/seller">Home</Link>
        <span> / Settings / Profile</span>
      </div>
      <h1 className={styles.pageTitle}>Store Profile</h1>
      <p className={styles.pageSubtitle}>Manage your public profile and payout info.</p>

      <div className={styles.card}>
        <div className={styles.cardBody}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 700 }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>{user?.name || 'Store'}</h2>
              <p style={{ margin: 0, fontSize: 14, color: '#2563eb' }}>urbannxt.com/shop/{user?.name?.toLowerCase().replace(/\s+/g, '-') || 'store'}</p>
              <span className={`${styles.badge} ${styles.green}`} style={{ marginTop: 8, display: 'inline-block' }}>✓ Verified Seller</span>
            </div>
            <button type="button" className={styles.secondaryButton}>View Public Store</button>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>General Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Store Name</label>
              <input defaultValue={user?.name || ''} placeholder="Store name" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Store URL Slug</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 8, overflow: 'hidden' }}>
                <span style={{ padding: '10px 12px', background: '#f9fafb', fontSize: 14, color: '#6b7280' }}>urbannxt.com/shop/</span>
                <input defaultValue={user?.name?.toLowerCase().replace(/\s+/g, '-') || 'store'} style={{ flex: 1, padding: 10, border: 'none', fontSize: 14 }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Support Email</label>
              <input defaultValue={user?.email || ''} type="email" placeholder="help@store.com" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500 }}>Support Phone</label>
              <input defaultValue={user?.phone || ''} placeholder="+1 (555) 000-0000" style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 8 }} />
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>Branding</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            <div style={{ border: '2px dashed #d1d5db', borderRadius: 12, padding: 32, textAlign: 'center', background: '#f9fafb' }}>
              <p style={{ margin: '0 0 8px', fontSize: 14, color: '#6b7280' }}>Store Logo</p>
              <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>PNG, JPG up to 2MB</p>
            </div>
            <div style={{ border: '2px dashed #d1d5db', borderRadius: 12, padding: 32, textAlign: 'center', background: '#f9fafb' }}>
              <p style={{ margin: '0 0 8px', fontSize: 14, color: '#6b7280' }}>Cover Banner</p>
              <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>1200x300px recommended</p>
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>About the Store</h3>
          <textarea placeholder="Tell your customers about your store..." rows={4} style={{ width: '100%', padding: 12, border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} />
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>Last saved: —</p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" className={styles.secondaryButton}>Cancel</button>
            <button type="button" className={styles.primaryButton}>Save Changes</button>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
