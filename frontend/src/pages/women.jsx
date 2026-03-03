import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Women() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/products?category=Women');
  }, [router]);
  return null;
}
