import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type FavoriteState = {
  favoriteSiteIds: string[];
};

export type FavoriteAction = {
    toggleFavoriteSite: (siteId: string) => void;
};

export type FavoriteStateAction = FavoriteState & FavoriteAction;

export const useFavoriteStore = create<FavoriteStateAction>()(
  persist(
    immer(set => ({
      favoriteSiteIds: [],
      toggleFavoriteSite: siteId =>
        set(state => {
          if (state.favoriteSiteIds.includes(siteId)) {
            state.favoriteSiteIds = state.favoriteSiteIds.filter((id: string) => id !== siteId);
          } else {
            state.favoriteSiteIds.push(siteId);
          }
        }),
    })),
    {
      name: "favorite",
      partialize: (state) => ({ favoriteSiteIds: state.favoriteSiteIds }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);