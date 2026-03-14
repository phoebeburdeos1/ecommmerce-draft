import Link from 'next/link';
import styles from '@/styles/auth.module.scss';

export default function ForgotPassword() {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authIconWrap}>
          <span className={styles.authIcon} aria-hidden>🔑</span>
        </div>
        <h1 className={styles.authTitle}>Forgot password?</h1>
        <p className={styles.authSubtitle}>
          Contact support or your administrator to reset your password.
        </p>
        <Link href="/auth/login" className={styles.submitBtn} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
          Back to Sign in
        </Link>
      </div>
    </div>
  );
}
