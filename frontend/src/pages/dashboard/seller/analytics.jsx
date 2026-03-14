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
        <div className={styles.cardBody} style={{ padding: 0 }}>
          <div className={styles.analyticsPlaceholder}>
            <div className={styles.analyticsIcon}>📊</div>
            <p>Analytics coming soon</p>
            <span>Charts for sales over time, top products, and revenue trends will appear here.</span>
          </div>
        </div>
      </div>
      <div className={styles.statsGrid} style={{ marginTop: 24 }}>
        <div className={styles.card} style={{ padding: 24 }}>
          <div className={styles.analyticsPlaceholder} style={{ minHeight: 160 }}>
            <span className={styles.analyticsIcon} style={{ fontSize: 32 }}>📈</span>
            <p style={{ fontSize: 14 }}>Sales over time</p>
          </div>
        </div>
        <div className={styles.card} style={{ padding: 24 }}>
          <div className={styles.analyticsPlaceholder} style={{ minHeight: 160 }}>
            <span className={styles.analyticsIcon} style={{ fontSize: 32 }}>🏆</span>
            <p style={{ fontSize: 14 }}>Top products</p>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
