'use client';

import { useEffect } from 'react';
import { usePlan } from '@/lib/store';

/** Rehydrates the persisted plan after mount so server and client render the same first frame. */
export function StoreHydrator() {
  useEffect(() => {
    usePlan.persist.rehydrate();
  }, []);
  return null;
}
