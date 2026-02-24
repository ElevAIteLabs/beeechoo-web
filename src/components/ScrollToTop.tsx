import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Simple component that scrolls to top on route change
export default function ScrollToTop(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    // Jump to top when the pathname changes
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (e) {
      // fallback for unusual environments
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
