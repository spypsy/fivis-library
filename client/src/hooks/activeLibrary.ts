import { useCallback, useEffect, useState } from 'react';

export type ActiveLibrary = {
  ownerId: string;
  ownerName: string;
};

const STORAGE_KEY = 'active-library';
export const ACTIVE_LIBRARY_CHANGED_EVENT = 'fivis-active-library-changed';

export function readActiveLibrary(): ActiveLibrary | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    const parsed = JSON.parse(raw) as Partial<ActiveLibrary>;
    if (!parsed.ownerId || !parsed.ownerName) {
      return undefined;
    }
    return { ownerId: parsed.ownerId, ownerName: parsed.ownerName };
  } catch {
    return undefined;
  }
}

export function writeActiveLibrary(library: ActiveLibrary | undefined) {
  if (!library) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  }
  window.dispatchEvent(new Event(ACTIVE_LIBRARY_CHANGED_EVENT));
}

export function clearActiveLibrary() {
  writeActiveLibrary(undefined);
}

export function useActiveLibrary() {
  const [activeLibrary, setActiveLibraryState] = useState<ActiveLibrary | undefined>(readActiveLibrary);

  useEffect(() => {
    const sync = () => setActiveLibraryState(readActiveLibrary());
    window.addEventListener(ACTIVE_LIBRARY_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(ACTIVE_LIBRARY_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const setActiveLibrary = useCallback((library: ActiveLibrary | undefined) => {
    writeActiveLibrary(library);
    setActiveLibraryState(library);
  }, []);

  return {
    activeLibrary,
    setActiveLibrary,
    isViewingShared: !!activeLibrary,
  };
}
