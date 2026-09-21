import { useEffect, useRef } from 'react';

/**
 * Calls `onOutside` when a pointer-down happens outside the returned ref's element,
 * or when Escape is pressed. Only listens while `active` is true.
 */
export function useClickOutside(active, onOutside) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;

    const handlePointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onOutside();
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') onOutside();
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [active, onOutside]);

  return ref;
}
