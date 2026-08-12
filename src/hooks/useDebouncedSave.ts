import { useEffect, useRef, useCallback } from 'react';

const DEBOUNCE_MS = 1500;

// Tiptap emits an empty document as '<p></p>'; treat that as empty so we don't
// persist an empty paragraph and so clearing the editor round-trips as null.
const normalize = (value: string) => (value === '<p></p>' ? '' : value);

/**
 * Debounces saves of editor HTML, skipping writes that wouldn't change anything.
 *
 * `initialValue` must be the content the editor was mounted with — it seeds the
 * "already saved" baseline. Without it the baseline starts empty, and clearing a
 * non-empty document produces '' === baseline, so the deletion is silently dropped.
 */
export function useDebouncedSave(save: (value: string) => void, initialValue = '') {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef(normalize(initialValue));
  const lastSavedRef = useRef(normalize(initialValue));
  const saveRef = useRef(save);

  useEffect(() => {
    saveRef.current = save;
  });

  const handleUpdate = useCallback((value: string) => {
    const normalized = normalize(value);
    latestRef.current = normalized;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
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
        debounceRef.current = null;
        if (latestRef.current !== lastSavedRef.current) {
          lastSavedRef.current = latestRef.current;
          saveRef.current(latestRef.current);
        }
      }
    };
  }, []);

  return handleUpdate;
}
