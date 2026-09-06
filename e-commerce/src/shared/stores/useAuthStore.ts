import { create } from "zustand";
import { authService, type User } from "@/features/auth/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: () => {
    const user = authService.getUser();
    const isAuthenticated = authService.isAuthenticated();
    console.log("[useAuthStore] Initialize:", { user, isAuthenticated });
    set({
      user,
      isAuthenticated,
      isLoading: false,
    });
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
