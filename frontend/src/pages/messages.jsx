import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';

export default function Messages() {
  const { user } = useAuth();

  return (
    <div style={{ maxWidth: 900, margin: '32px auto', padding: '0 20px' }}>
      <Head>
        <title>Messages - UrbanNext</title>
      </Head>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Messages</h1>
      <p style={{ color: '#4b5563', marginBottom: 24 }}>
        A space where customers and sellers can communicate about orders.
      </p>
      {!user ? (
        <p>Please log in to view your messages.</p>
      ) : (
        <div
          style={{
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            padding: 20,
            background: '#fff',
          }}
        >
          <p style={{ margin: 0, color: '#6b7280' }}>
            Messaging is coming soon. For now, you can use the contact details in the footer or your
            order notes to coordinate with the seller.
          </p>
        </div>
      )}
    </div>
  );
}

