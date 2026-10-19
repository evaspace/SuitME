import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface GenerationResult {
  id: string;
  provider?: 'gemini';
  imageUrl: string;
  poseId: string;
  poseLabel: string;
  modelName: string;
  style: string;
  createdAt: string;
  listingTitle: string;
  listingDescription: string;
  listingTags: string;
}

export interface GenerationStore {
  results: GenerationResult[];
  isGenerating: boolean;
  progress: number;
  setResults: (results: GenerationResult[]) => void;
  updateResult: (id: string, changes: Partial<GenerationResult>) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setProgress: (progress: number) => void;
  addResult: (result: GenerationResult) => void;
  addResults: (results: GenerationResult[]) => void;
  clearResults: () => void;
}

export const useGenerationStore = create<GenerationStore>()(persist((set) => ({
  results: [],
  isGenerating: false,
  progress: 0,
  setResults: (results) => set({ results }),
  updateResult: (id, changes) => set((state) => ({ results: state.results.map((result) => result.id === id ? { ...result, ...changes } : result) })),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setProgress: (progress) => set({ progress }),
  addResult: (result) => set((state) => ({ results: [...state.results, result] })),
  addResults: (results) => set((state) => ({ results: [...state.results, ...results] })),
  clearResults: () => set({ results: [], progress: 0, isGenerating: false }),
}), { name: 'dress-me-results-v1', storage: createJSONStorage(() => localStorage), skipHydration: true }));
