import { create } from 'zustand';

const revokePreviewUrl = (url: string | null) => {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
};

export interface GarmentStore {
  rawFile: File | null;
  previewUrl: string | null;
  segmentedMaskUrl: string | null;
  isSegmenting: boolean;
  detectedCategory: string | null;
  styleConfig: {
    targetStyle: 'chic' | 'casual' | 'streetwear' | 'business';
    autoSelectPoses: boolean;
    selectedPoseIds: string[];
    accessorize: boolean;
    accessoryDensity: number; // 0 to 100
  };
  setGarmentFile: (file: File) => void;
  setSegmentedResult: (maskUrl: string, category: string) => void;
  updateStyleConfig: (config: Partial<GarmentStore['styleConfig']>) => void;
  clearGarmentSession: () => void;
}

export const useGarmentStore = create<GarmentStore>((set) => ({
  rawFile: null,
  previewUrl: null,
  segmentedMaskUrl: null,
  isSegmenting: false,
  detectedCategory: null,
  styleConfig: {
    targetStyle: 'chic',
    autoSelectPoses: true,
    selectedPoseIds: [],
    accessorize: false,
    accessoryDensity: 50,
  },
  setGarmentFile: (file) => set((state) => {
    revokePreviewUrl(state.previewUrl);
    if (state.segmentedMaskUrl !== state.previewUrl) {
      revokePreviewUrl(state.segmentedMaskUrl);
    }
    return {
      rawFile: file,
      previewUrl: URL.createObjectURL(file),
      segmentedMaskUrl: null,
      isSegmenting: false,
      detectedCategory: null,
    };
  }),
  setSegmentedResult: (maskUrl, category) => set((state) => {
    if (state.segmentedMaskUrl !== state.previewUrl && state.segmentedMaskUrl !== maskUrl) {
      revokePreviewUrl(state.segmentedMaskUrl);
    }
    return {
      segmentedMaskUrl: maskUrl,
      detectedCategory: category,
      isSegmenting: false,
    };
  }),
  updateStyleConfig: (config) => set(state => ({
    styleConfig: { ...state.styleConfig, ...config },
  })),
  clearGarmentSession: () => set((state) => {
    revokePreviewUrl(state.previewUrl);
    if (state.segmentedMaskUrl !== state.previewUrl) {
      revokePreviewUrl(state.segmentedMaskUrl);
    }
    return {
      rawFile: null,
      previewUrl: null,
      segmentedMaskUrl: null,
      isSegmenting: false,
      detectedCategory: null,
      styleConfig: {
        targetStyle: 'chic',
        autoSelectPoses: true,
        selectedPoseIds: [],
        accessorize: false,
        accessoryDensity: 50,
      },
    };
  }),
}));
