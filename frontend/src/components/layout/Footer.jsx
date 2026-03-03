import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            <span className="brand-n">N</span>
            <span className="brand-name">urbanNxt</span>
          </Link>
          <p className="footer-tagline">
            Quality essentials for the modern wardrobe. Designed for comfort, built to last.
          </p>
          <div className="footer-social">
            <a
              href="https://x.com/UrbanNxt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter) @UrbanNxt"
            >
              <span className="social-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M5 4h4.2l3.1 4.5L15.8 4H19l-5 7 5.2 9H15l-3.3-5-3.4 5H5.1L10 11 5 4z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="social-handle">@UrbanNxt</span>
            </a>
            <a
              href="https://instagram.com/YoUrbanNxt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @YoUrbanNxt"
            >
              <span className="social-icon insta">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="url(#igGrad)" />
                  <circle cx="12" cy="12" r="4" fill="none" stroke="white" strokeWidth="1.6" />
                  <circle cx="17" cy="7" r="1.2" fill="white" />
                  <defs>
                    <linearGradient id="igGrad" x1="3" y1="3" x2="21" y2="21">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="50%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <span className="social-handle">@YoUrbanNxt</span>
            </a>
            <a
              href="https://facebook.com/UrbanNxt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook UrbanNxt"
            >
              <span className="social-icon fb">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" fill="#1877F2" />
                  <path
                    d="M13.4 8H15V5.5h-1.6C10.9 5.5 10 7 10 8.9V10H8v2.5h2v6h2.5v-6H15V10h-2.5V9c0-.7.2-1 1-1z"
                    fill="#fff"
                  />
                </svg>
              </span>
              <span className="social-handle">UrbanNxt</span>
            </a>
          </div>
          <p className="footer-contact">
            Contact: +63 955 626 8
          </p>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><Link href="/products">Men&apos;s New Arrivals</Link></li>
            <li><Link href="/products">Best Sellers</Link></li>
            <li><Link href="/products?category=Men">Outerwear</Link></li>
            <li><Link href="/products?category=Kids">Kids</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li><Link href="/dashboard/customer">Order Status</Link></li>
            <li><a href="#">Returns &amp; Exchanges</a></li>
            <li><a href="#">Shipping Info</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>
        <div className="footer-newsletter">
          <h4>Stay in the loop</h4>
          <p>Subscribe for exclusive offers and news.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Email address" aria-label="Email" />
            <button type="submit">Join</button>
          </form>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2023 urbanNxt Inc.</span>
        <div className="footer-legal">
          <Link href="/about">About Us</Link>
          <a href="#">Contact</a>
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
