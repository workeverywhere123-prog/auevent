"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

const STORAGE_KEY = "ozfest_starred";

interface StarredContextValue {
  starred: Set<string>;
  isStarred: (id: string) => boolean;
  toggle: (id: string) => void;
  ready: boolean;
}

const StarredContext = createContext<StarredContextValue | null>(null);

export function StarredProvider({ children }: { children: ReactNode }) {
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setStarred(new Set(JSON.parse(raw)));
      } catch {}
      setReady(true);
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setStarred(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  const isStarred = useCallback((id: string) => starred.has(id), [starred]);

  return (
    <StarredContext.Provider value={{ starred, isStarred, toggle, ready }}>
      {children}
    </StarredContext.Provider>
  );
}

export function useStarredContext() {
  const ctx = useContext(StarredContext);
  if (!ctx) throw new Error("useStarredContext must be used within StarredProvider");
  return ctx;
}
