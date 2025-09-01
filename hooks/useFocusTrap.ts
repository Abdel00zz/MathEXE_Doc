
import { useEffect, useRef } from 'react';

/**
 * A hook to trap focus within a given HTML element.
 * This is crucial for accessibility in components like modals.
 * @param elementRef Ref to the element that should trap focus.
 * @param isOpen Boolean indicating if the trap should be active.
 */
export const useFocusTrap = (elementRef: React.RefObject<HTMLElement>, isOpen: boolean) => {
  const firstFocusableElementRef = useRef<HTMLElement | null>(null);
  const lastFocusableElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen && elementRef.current) {
      const focusableElements = elementRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        firstFocusableElementRef.current = focusableElements[0];
        lastFocusableElementRef.current = focusableElements[focusableElements.length - 1];

        // Focus the first element when the trap activates
        firstFocusableElementRef.current.focus();
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) { // Shift+Tab
          if (document.activeElement === firstFocusableElementRef.current) {
            lastFocusableElementRef.current?.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastFocusableElementRef.current) {
            firstFocusableElementRef.current?.focus();
            e.preventDefault();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, elementRef]);
};
