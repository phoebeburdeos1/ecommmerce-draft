import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Handles URLs like /products/category-Men and redirects to /products?category=Men.
 * Prevents "Application error" when users hit this path (e.g. from bookmarks or old links).
 */
export default function ProductsCategoryRedirect() {
  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    if (!slug) return;
    const category = slug.startsWith('category-')
      ? slug.replace('category-', '')
      : null;
    if (category) {
      router.replace(`/products?category=${encodeURIComponent(category)}`);
    } else {
      router.replace('/products');
    }
  }, [slug, router]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      Redirecting…
    </div>
  );
}
