'use client';

import { useSyncExternalStore } from 'react';
import { useGenerationStore } from '@/store/useGenerationStore';
import { useModelStore } from '@/store/useModelStore';

let hydrationStarted = false;
let localDataReady = false;
const listeners = new Set<() => void>();

// The app was renamed from Dress Me to SuitMe: carry over data saved under the old keys once.
const RENAMED_STORAGE_KEYS: Array<[oldKey: string, newKey: string]> = [
  ['dress-me-models-v1', 'suitme-models-v1'],
  ['dress-me-results-v1', 'suitme-results-v1'],
];

function migrateRenamedStorageKeys() {
  try {
    for (const [oldKey, newKey] of RENAMED_STORAGE_KEYS) {
      const saved = localStorage.getItem(oldKey);
      if (saved !== null && localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, saved);
        localStorage.removeItem(oldKey);
      }
    }
  } catch (cause) {
    console.error('[SuitMe storage] migration of renamed keys failed', cause);
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!hydrationStarted) {
    hydrationStarted = true;
    migrateRenamedStorageKeys();
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
