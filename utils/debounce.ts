/**
 * Interface for a debounced function with utility methods.
 */
export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel(): void;
  flush(): void;
  pending(): boolean;
}

/**
 * Delays the execution of a function until a certain amount of time has passed
 * since the last time it was invoked. This implementation calls the function on
 * the trailing edge of the delay.
 *
 * @param func The function to debounce.
 * @param delay The number of milliseconds to delay.
 * @returns A new debounced function with utility methods.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let latestArgs: Parameters<T> | null = null;

  const debounced = (...args: Parameters<T>): void => {
    latestArgs = args;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      if (latestArgs) {
        func(...latestArgs);
        latestArgs = null;
      }
    }, delay);
  };

  (debounced as DebouncedFunction<T>).cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = null;
    latestArgs = null;
  };

  (debounced as DebouncedFunction<T>).flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      if (latestArgs) {
        func(...latestArgs);
      }
    }
    timeoutId = null;
    latestArgs = null;
  };
  
  (debounced as DebouncedFunction<T>).pending = () => {
    return timeoutId !== null;
  };

  return debounced as DebouncedFunction<T>;
}
