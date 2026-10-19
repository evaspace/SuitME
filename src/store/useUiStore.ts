import { create } from 'zustand';

interface UiStore {
  drawerOpen: boolean;
  theme: 'light' | 'dark';
  setDrawerOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUiStore = create<UiStore>((set) => ({
  drawerOpen: false,
  theme: 'light',
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  setTheme: (theme) => set({ theme: theme }),
}));
