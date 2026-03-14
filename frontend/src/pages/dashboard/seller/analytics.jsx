import Link from 'next/link';
import SellerLayout from '@/components/seller/SellerLayout';
import styles from '@/styles/sellerPortal.module.scss';

export default function SellerAnalytics() {
  return (
    <SellerLayout>
      <div className={styles.breadcrumb}>
        <Link href="/dashboard/seller">Home</Link>
        <span> / Analytics</span>
      </div>
      <h1 className={styles.pageTitle}>Sales Reports</h1>
      <p className={styles.pageSubtitle}>View your sales performance and analytics.</p>
      <div className={styles.card}>
        <div className={styles.cardBody} style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
          Analytics charts and reports — connect your data to show sales over time, top products, and more.
        </div>
      </div>
    </SellerLayout>
  );
}
