import { create } from 'zustand';
import { Spot } from '@/lib/types';

interface SpotsState {
  spots: Spot[];
  selectedSpot: Spot | null;
  isLoadingSpots: boolean;
  isReporting: boolean;
  showReportModal: boolean;
  setSpots: (spots: Spot[]) => void;
  upsertSpot: (spot: Spot) => void;
  removeSpot: (spotId: string) => void;
  setSelectedSpot: (spot: Spot | null) => void;
  setIsLoadingSpots: (loading: boolean) => void;
  setIsReporting: (reporting: boolean) => void;
  setShowReportModal: (show: boolean) => void;
}

export const useSpotsStore = create<SpotsState>((set) => ({
  spots: [],
  selectedSpot: null,
  isLoadingSpots: false,
  isReporting: false,
  showReportModal: false,

  setSpots: (spots) => set({ spots }),

  upsertSpot: (spot) =>
    set((state) => {
      const exists = state.spots.findIndex((s) => s.id === spot.id);
      if (exists >= 0) {
        const updated = [...state.spots];
        updated[exists] = spot;
        return { spots: updated };
      }
      return { spots: [spot, ...state.spots] };
    }),

  removeSpot: (spotId) =>
    set((state) => ({
      spots: state.spots.filter((s) => s.id !== spotId),
      selectedSpot: state.selectedSpot?.id === spotId ? null : state.selectedSpot,
    })),

  setSelectedSpot: (selectedSpot) => set({ selectedSpot }),
  setIsLoadingSpots: (isLoadingSpots) => set({ isLoadingSpots }),
  setIsReporting: (isReporting) => set({ isReporting }),
  setShowReportModal: (showReportModal) => set({ showReportModal }),
}));
