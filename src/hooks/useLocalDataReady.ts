'use client';

import { useSyncExternalStore } from 'react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { useModelStore } from '@/store/useModelStore';

let hydrationStarted = false;
let localDataReady = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!hydrationStarted) {
    hydrationStarted = true;
    void Promise.all([
      Promise.resolve(useModelStore.persist.rehydrate()),
      Promise.resolve(useGenerationStore.persist.rehydrate()),
    ]).catch(() => undefined).finally(() => {
      localDataReady = true;
      listeners.forEach((notify) => notify());
    });
  }
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return localDataReady;
}

export function useLocalDataReady() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
