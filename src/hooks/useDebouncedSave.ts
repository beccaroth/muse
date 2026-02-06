import { useEffect, useRef, useCallback } from 'react';

const DEBOUNCE_MS = 1500;

export function useDebouncedSave(save: (value: string) => void) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef('');
  const lastSavedRef = useRef('');
  const saveRef = useRef(save);
  saveRef.current = save;

  const handleUpdate = useCallback((value: string) => {
    latestRef.current = value;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const normalized = value === '<p></p>' ? '' : value;
      if (normalized !== lastSavedRef.current) {
        lastSavedRef.current = normalized;
        saveRef.current(normalized);
      }
    }, DEBOUNCE_MS);
  }, []);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        const normalized =
          latestRef.current === '<p></p>' ? '' : latestRef.current;
        if (normalized !== lastSavedRef.current) {
          saveRef.current(normalized);
        }
      }
    };
  }, []);

  return handleUpdate;
}
