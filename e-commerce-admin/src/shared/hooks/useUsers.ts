import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  usersApi,
  UserFilter,
  UpdateUserDto,
  AdjustUserBonusDto,
  ChangeUserPasswordDto,
} from "../api";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filter: UserFilter) => [...userKeys.lists(), filter] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  bonusBalance: (id: string) => [...userKeys.detail(id), "bonus-balance"] as const,
  stats: () => [...userKeys.all, "stats"] as const,
};

export function useUsers(filter?: UserFilter) {
  return useQuery({
    queryKey: userKeys.list(filter || {}),
    queryFn: () => usersApi.getAll(filter),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => usersApi.getStats(),
  });
}

export function useUserBonusBalance(id: string) {
  return useQuery({
    queryKey: userKeys.bonusBalance(id),
    queryFn: () => usersApi.getBonusBalance(id),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      usersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

export function useChangeUserPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ChangeUserPasswordDto;
    }) => usersApi.changePassword(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.ban(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.unban(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useAccrueUserBonus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustUserBonusDto }) =>
      usersApi.accrueBonus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.bonusBalance(id) });
    },
  });
}

export function useWriteOffUserBonus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustUserBonusDto }) =>
      usersApi.writeOffBonus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.bonusBalance(id) });
    },
  });
}
