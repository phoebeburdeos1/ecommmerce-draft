import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/urbannext.module.scss';
import React from 'react';

export default function UrbanNext() {
    const { user } = useAuth();
    const router = useRouter();

    const handleAddToCart = (e, id) => {
        e.preventDefault();
        if (!user) {
            alert('You need to log in first');
            router.push('/auth/login');
        } else {
            alert(`Product ${id} added to cart! (Coming Soon)`);
            console.log('Added product ' + id + ' to cart');
        }
    };

    return (
        <>
            <Head>
                <title>UrbanNext - Redefine Your Style</title>
            </Head>

            <div style={{ padding: '0 20px', maxWidth: '1100px', margin: '40px auto' }}>
                <section className={styles.hero}>
                    <div className={styles.heroCopy}>
                        <div className={styles.eyebrow}>New Arrivals</div>
                        <h1 className={styles.heroTitle}>Redefine Your Style</h1>
                        <p className={styles.heroDesc}>
                            Discover the latest trends for the season. Elevate your wardrobe with our exclusive new collection.
                        </p>
                        <Link href="/products" className={styles.btn}>
                            Shop New Arrivals
                        </Link>
                    </div>
                </section>

                <section style={{ marginTop: '28px' }}>
                    <div className={styles.sectionHeader}>
                        <h2>Featured Collections</h2>
                        <Link href="/products">View All</Link>
                    </div>
                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <img src="http://localhost:8000/images/urban_feat1.jpg" alt="Featured 1" onError={(e) => { e.target.src = 'https://placehold.co/600x400'; }} />
                            <h3>Summer Essentials</h3>
                            <p>Breezy styles for hot days</p>
                        </div>
                        <div className={styles.card}>
                            <img src="http://localhost:8000/images/urban_feat2.jpg" alt="Featured 2" onError={(e) => { e.target.src = 'https://placehold.co/600x400'; }} />
                            <h3>Office Wear</h3>
                            <p>Professional & comfortable</p>
                        </div>
                        <div className={styles.card}>
                            <img src="http://localhost:8000/images/urban_feat3.jpg" alt="Featured 3" onError={(e) => { e.target.src = 'https://placehold.co/600x400'; }} />
                            <h3>Weekend Vibes</h3>
                            <p>Relaxed fits for downtime</p>
                        </div>
                    </div>
                </section>

                <section style={{ marginTop: '28px' }}>
                    <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Trending Now</h3>
                    <div className={styles.trending}>
                        <div className={styles.product}>
                            <img src="http://localhost:8000/images/urban_prod1.jpg" alt="Product 1" onError={(e) => { e.target.src = 'https://placehold.co/400x400'; }} />
                            <div className={styles.productTitle}>Classic Denim Jacket</div>
                            <div className={styles.price}>$89.00</div>
                            <button className={styles.add} onClick={(e) => handleAddToCart(e, 1)}>Add to Cart</button>
                        </div>
                        <div className={styles.product}>
                            <img src="http://localhost:8000/images/urban_prod2.jpg" alt="Product 2" onError={(e) => { e.target.src = 'https://placehold.co/400x400'; }} />
                            <div className={styles.productTitle}>Floral Summer Dress</div>
                            <div className={styles.price}>$55.00</div>
                            <button className={styles.add} onClick={(e) => handleAddToCart(e, 2)}>Add to Cart</button>
                        </div>
                        <div className={styles.product}>
                            <img src="http://localhost:8000/images/urban_prod3.jpg" alt="Product 3" onError={(e) => { e.target.src = 'https://placehold.co/400x400'; }} />
                            <div className={styles.productTitle}>Slim Fit Chinos</div>
                            <div className={styles.price}>$45.00</div>
                            <button className={styles.add} onClick={(e) => handleAddToCart(e, 3)}>Add to Cart</button>
                        </div>
                        <div className={styles.product}>
                            <img src="http://localhost:8000/images/urban_prod4.jpg" alt="Product 4" onError={(e) => { e.target.src = 'https://placehold.co/400x400'; }} />
                            <div className={styles.productTitle}>Leather Biker Jacket</div>
                            <div className={styles.price}>$120.00</div>
                            <button className={styles.add} onClick={(e) => handleAddToCart(e, 4)}>Add to Cart</button>
                        </div>
                    </div>
                </section>

                <section className={styles.subscribe}>
                    <h3>Join Our Community</h3>
                    <p>Subscribe for exclusive updates, new arrivals, and insider-only discounts.</p>
                    <div className={styles.subForm}>
                        <input type="email" placeholder="Enter your email address" />
                        <button className={styles.btn}>Subscribe</button>
                    </div>
                </section>
            </div>
        </>
    );
}
