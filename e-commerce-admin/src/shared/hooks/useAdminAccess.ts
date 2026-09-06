"use client";

import { useEffect, useMemo, useState } from "react";
import {
  canDeleteBrands,
  canDeleteCategories,
  canDeleteProducts,
  getStoredAdminRole,
  isAdminRole,
  isManagerRole,
  type AdminRole,
} from "@/shared/lib/adminAccess";

export function useAdminAccess() {
  const [role, setRole] = useState<AdminRole | null>(null);

  useEffect(() => {
    const refreshRole = () => {
      setRole(getStoredAdminRole());
    };

    refreshRole();
    window.addEventListener("storage", refreshRole);
    window.addEventListener("focus", refreshRole);

    return () => {
      window.removeEventListener("storage", refreshRole);
      window.removeEventListener("focus", refreshRole);
    };
  }, []);

  return useMemo(
    () => ({
      role,
      isAdmin: isAdminRole(role),
      isManager: isManagerRole(role),
      canDeleteProducts: canDeleteProducts(role),
      canDeleteBrands: canDeleteBrands(role),
      canDeleteCategories: canDeleteCategories(role),
    }),
    [role],
  );
}
