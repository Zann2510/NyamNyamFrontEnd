import { useState, useEffect } from 'react';

/**
 * LocalStorage hook - menyimpan state ke localStorage dan sinkronisasi antar tab.
 *
 * @param key - Kunci di localStorage
 * @param initialValue - Nilai awal (atau function untuk lazy initialization)
 * @returns [storedValue, setValue, removeValue] seperti useState plus fungsi hapus
 *
 * @example
 * const [cart, setCart, clearCart] = useLocalStorage<CartItem[]>('cart', []);
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State untuk menyimpan nilai
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  // Fungsi untuk menyimpan nilai ke state dan localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Trigger event untuk sinkronisasi antar tab/window
        window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(valueToStore) }));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  // Fungsi untuk menghapus item dari localStorage
  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        window.dispatchEvent(new StorageEvent('storage', { key, newValue: null }));
      }
    } catch (error) {
      console.warn(`Error removing localStorage key “${key}”:`, error);
    }
  };

  // Mendengarkan perubahan storage dari tab lain (sinkronisasi)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue) as T;
          setStoredValue(newValue);
        } catch {
          // jika parsing gagal, abaikan
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}  