"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { GuestSessionInitializer } from "@/features/auth";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
            gcTime: 10 * 60 * 1000, // 10 минут - время хранения в кеше
            refetchOnWindowFocus: false, // Не обновлять при фокусе окна
            refetchOnMount: false, // Не обновлять при монтировании, если данные свежие
            refetchOnReconnect: false, // Не обновлять при восстановлении соединения
            retry: 1, // Повторять только 1 раз при ошибке
            retryDelay: 1000, // Задержка между повторами 1 сек
          },
          mutations: {
            retry: 1, // Повторять мутации только 1 раз при ошибке
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GuestSessionInitializer />
      {children}
    </QueryClientProvider>
  );
}
