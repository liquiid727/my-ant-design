import { create } from 'zustand';

type UIState = {
  isSettingsOpen: boolean;
  isAIDrawerOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  toggleAI: () => void;
  openAI: () => void;
  closeAI: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  isSettingsOpen: false,
  isAIDrawerOpen: false,
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  toggleAI: () => set((state) => ({ isAIDrawerOpen: !state.isAIDrawerOpen })),
  openAI: () => set({ isAIDrawerOpen: true }),
  closeAI: () => set({ isAIDrawerOpen: false }),
}));

