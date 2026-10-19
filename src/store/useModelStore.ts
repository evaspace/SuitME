import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const POSE_CATEGORIES = ['front_standing', 'profile', 'three_quarter', 'sitting', 'back'] as const;
export type PoseCategory = (typeof POSE_CATEGORIES)[number];
export type ModelStyle = 'casual' | 'chic' | 'streetwear' | 'business';

export interface Pose {
  id: string;
  category: PoseCategory;
  imageUrl: string;
  isDefault: boolean;
}

export interface Model {
  id: string;
  name: string;
  gender: 'female' | 'male' | 'unisex';
  size: string;
  skinTone: string;
  defaultStyle: ModelStyle;
  poses: Pose[];
  active: boolean;
  createdAt: string;
}

interface ModelStore {
  models: Model[];
  selectedModelId: string | null;
  activeModel: () => Model | undefined;
  addModel: (model: Omit<Model, 'id' | 'createdAt' | 'active'>) => string;
  updateModel: (id: string, changes: Partial<Omit<Model, 'id' | 'poses'>>) => void;
  deleteModel: (id: string) => void;
  updatePoses: (modelId: string, poses: Pose[]) => void;
  selectModel: (id: string) => void;
}

const starterModels: Model[] = [];

export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `model-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useModelStore = create<ModelStore>()(persist((set, get) => ({
  models: starterModels,
  selectedModelId: null,
  activeModel: () => get().models.find((model) => model.id === get().selectedModelId),
  addModel: (model) => {
    const id = createId();
    set((state) => ({ models: [{ ...model, id, active: true, createdAt: new Date().toISOString() }, ...state.models] }));
    return id;
  },
  updateModel: (id, changes) => set((state) => ({ models: state.models.map((model) => model.id === id ? { ...model, ...changes } : model) })),
  deleteModel: (id) => set((state) => ({ models: state.models.filter((model) => model.id !== id), selectedModelId: state.selectedModelId === id ? null : state.selectedModelId })),
  updatePoses: (modelId, poses) => set((state) => ({ models: state.models.map((model) => model.id === modelId ? { ...model, poses } : model) })),
  selectModel: (id) => set({ selectedModelId: id }),
}), { name: 'dress-me-models-v1', storage: createJSONStorage(() => localStorage), skipHydration: true }));
