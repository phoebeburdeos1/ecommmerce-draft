import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Men() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/products?category=Men');
  }, [router]);
  return null;
}
