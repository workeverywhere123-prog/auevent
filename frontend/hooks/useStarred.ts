"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "ozfest_starred";

export function useStarred() {
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setStarred(new Set(JSON.parse(raw)));
    } catch {}
    setReady(true);
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

  return { starred, isStarred, toggle, ready };
}
