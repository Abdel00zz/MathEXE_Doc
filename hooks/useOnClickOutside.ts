
import { useEffect, RefObject } from 'react';

type Event = MouseEvent | TouchEvent;

/**
 * A hook to handle clicks outside a specified element.
 * @param ref Ref object for the element to detect outside clicks for.
 * @param handler The function to call when a click outside is detected.
 */
export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};
