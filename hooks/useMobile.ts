
import { useState, useEffect } from 'react';

const isBrowser = typeof window !== 'undefined';
// Corresponds to Tailwind's `md` breakpoint (screens smaller than 768px).
const MOBILE_BREAKPOINT = '(max-width: 767px)';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (!isBrowser) {
      return false;
    }
    return window.matchMedia(MOBILE_BREAKPOINT).matches;
  });

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    const mediaQueryList = window.matchMedia(MOBILE_BREAKPOINT);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Using `addEventListener` which is the modern standard.
    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, []); // Empty dependency array ensures this runs only once on mount.

  return isMobile;
}
