import { useEffect, useState } from 'react';

/**
 * Debounce hook - menunda perubahan nilai hingga delay waktu tertentu.
 *
 * @param value - Nilai yang akan di-debounce (string, number, atau tipe lainnya)
 * @param delay - Waktu tunda dalam milidetik (default 500ms)
 * @returns Nilai yang telah di-debounce
 *
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     api.search(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}