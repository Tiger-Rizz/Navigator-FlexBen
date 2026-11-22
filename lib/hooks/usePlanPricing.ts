'use client';

import { useMemo } from 'react';
import type { Selection } from '@/lib/data';
import { price } from '@/lib/engine/pricing';
import { usePeople, usePersona } from '@/lib/store';

/** Engine breakdown for a selection, using the people and tax rate in the store. */
export function usePlanPricing(selection: Selection) {
  const people = usePeople();
  const persona = usePersona();
  const key = JSON.stringify(selection) + people.map((p) => p.id).join();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => price(selection, people, persona.taxRate), [key, persona.taxRate]);
}
