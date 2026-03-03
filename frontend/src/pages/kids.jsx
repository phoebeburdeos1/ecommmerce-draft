import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Kids() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/products?category=Kids');
  }, [router]);
  return null;
}
