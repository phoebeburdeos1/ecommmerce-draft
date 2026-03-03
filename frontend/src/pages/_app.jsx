import '@/styles/globals.scss';
import Layout from '@/components/layout/Layout';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

