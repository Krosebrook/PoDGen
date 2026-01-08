/**
 * Performance Optimization React Hooks
 * 
 * Custom hooks for optimizing React component performance:
 * - Debounced and throttled callbacks
 * - Intersection Observer for lazy loading
 * - Idle callback scheduling
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { debounce, throttle, runWhenIdle } from '../utils/performance';

/**
 * Hook for debounced values
 * Updates value only after specified delay of inactivity
 * 
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttled callbacks
 * Limits execution frequency of a callback
 * 
 * @param callback - Function to throttle
 * @param delay - Minimum time between executions
 * @returns Throttled callback
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useRef<T>();

  useEffect(() => {
    throttledCallback.current = throttle(callback, delay) as T;
  }, [callback, delay]);

  return useCallback(
    ((...args: Parameters<T>) => {
      return throttledCallback.current?.(...args);
    }) as T,
    []
  );
}

/**
 * Hook for debounced callbacks
 * Delays execution until after inactivity period
 * 
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced callback
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debouncedCallback = useRef<T>();

  useEffect(() => {
    debouncedCallback.current = debounce(callback, delay) as T;
  }, [callback, delay]);

  return useCallback(
    ((...args: Parameters<T>) => {
      return debouncedCallback.current?.(...args);
    }) as T,
    []
  );
}

/**
 * Hook for Intersection Observer
 * Detects when an element enters the viewport
 * 
 * @param options - IntersectionObserver options
 * @returns Ref to attach to element and isIntersecting state
 */
export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLElement>, boolean] {
  const elementRef = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [elementRef, isIntersecting];
}

/**
 * Hook for lazy loading components when they enter viewport
 * 
 * @param options - IntersectionObserver options
 * @returns Ref to attach to element and shouldLoad state
 */
export function useLazyLoad(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLElement>, boolean] {
  const elementRef = useRef<HTMLElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [shouldLoad, options]);

  return [elementRef, shouldLoad];
}

/**
 * Hook for running code when browser is idle
 * 
 * @param callback - Function to run during idle time
 * @param deps - Dependencies array
 */
export function useIdleCallback(
  callback: () => void,
  deps: React.DependencyList
): void {
  useEffect(() => {
    const handle = runWhenIdle(callback, { timeout: 1000 });

    return () => {
      cancelIdle(handle);
    };
  }, deps);
}

/**
 * Hook for measuring component render performance
 * 
 * @param componentName - Name of the component for logging
 */
export function useRenderPerformance(componentName: string): void {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current++;
    const endTime = performance.now();
    const duration = endTime - startTime.current;

    console.debug(
      `[Render] ${componentName} #${renderCount.current}: ${duration.toFixed(2)}ms`
    );

    startTime.current = performance.now();
  });
}

/**
 * Hook for previous value tracking
 * Useful for comparing with current value to prevent unnecessary updates
 * 
 * @param value - Current value
 * @returns Previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Hook for stable callback references with latest closure
 * Prevents unnecessary re-renders while keeping callback up-to-date
 * 
 * @param callback - Callback function
 * @returns Stable callback reference
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  const callbackRef = useRef<T>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args: Parameters<T>) => {
      return callbackRef.current(...args);
    }) as T,
    []
  );
}

/**
 * Hook for media query matching
 * 
 * @param query - Media query string
 * @returns Whether media query matches
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  }, [query]);

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    
    const handleChange = () => {
      setMatches(getMatches());
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query, getMatches]);

  return matches;
}

/**
 * Hook for window size tracking with debouncing
 * 
 * @param delay - Debounce delay in milliseconds
 * @returns Window width and height
 */
export function useWindowSize(delay: number = 200): {
  width: number;
  height: number;
} {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = debounce(() => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, delay);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [delay]);

  return size;
}

/**
 * Hook for scroll position tracking with throttling
 * 
 * @param delay - Throttle delay in milliseconds
 * @returns Scroll x and y positions
 */
export function useScrollPosition(delay: number = 100): {
  x: number;
  y: number;
} {
  const [position, setPosition] = useState({
    x: typeof window !== 'undefined' ? window.scrollX : 0,
    y: typeof window !== 'undefined' ? window.scrollY : 0,
  });

  useEffect(() => {
    const handleScroll = throttle(() => {
      setPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    }, delay);

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [delay]);

  return position;
}
