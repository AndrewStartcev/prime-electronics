"use client";

import { useEffect } from "react";
import { useGuestStore, useAuthStore } from "@/shared/stores";

/**
 * Component that initializes guest session on app load
 * Should be placed in the root layout/provider
 */
export function GuestSessionInitializer() {
  const { initialize, isInitialized } = useGuestStore();
  const {
    isAuthenticated,
    isLoading: authLoading,
    initialize: initializeAuth,
  } = useAuthStore();

  useEffect(() => {
    const handleAuthExpired = () => {
      useAuthStore.getState().logout();
    };

    window.addEventListener("auth:expired", handleAuthExpired);
    return () => {
      window.removeEventListener("auth:expired", handleAuthExpired);
    };
  }, []);

  // Initialize auth store first
  useEffect(() => {
    console.log("[GuestSessionInitializer] Initializing auth store");
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    console.log("[GuestSessionInitializer] Auth state:", {
      authLoading,
      isAuthenticated,
      isInitialized,
    });

    // Wait for auth to initialize first
    if (authLoading) {
      console.log("[GuestSessionInitializer] Waiting for auth to load...");
      return;
    }

    // If user is authenticated, don't initialize guest session
    if (isAuthenticated) {
      console.log(
        "[GuestSessionInitializer] User is authenticated, skipping guest session"
      );
      return;
    }

    // Initialize guest session if not already done
    if (!isInitialized) {
      console.log("[GuestSessionInitializer] Initializing guest session");
      initialize();
    }
  }, [authLoading, isAuthenticated, isInitialized, initialize]);

  return null;
}
