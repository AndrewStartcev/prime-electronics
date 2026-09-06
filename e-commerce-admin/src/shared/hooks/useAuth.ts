import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi, LoginCredentials } from "../api";
import { getStoredAdminRole } from "@/shared/lib/adminAccess";
import {
  clearAdminSession,
  hasAdminSession,
  setAdminSession,
} from "@/shared/lib/adminSession";

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      setAdminSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
      });
      queryClient.clear();
      router.push("/");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAdminSession();
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
  });
}

export function useAuth() {
  const isAuthenticated = typeof window !== "undefined" && hasAdminSession();
  const role = typeof window !== "undefined" ? getStoredAdminRole() : null;

  return { isAuthenticated, role };
}
