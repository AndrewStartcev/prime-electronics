import { create } from "zustand";

interface CartNotificationState {
  visible: boolean;
  show: () => void;
  hide: () => void;
}

export const useCartNotificationStore = create<CartNotificationState>(
  (set) => ({
    visible: false,
    show: () => set({ visible: true }),
    hide: () => set({ visible: false }),
  })
);
