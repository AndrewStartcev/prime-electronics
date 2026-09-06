"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/shared/stores/useAuthStore";

interface MobileMenuActionsProps {
  onClose: () => void;
}

export const MobileMenuActions = ({ onClose }: MobileMenuActionsProps) => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="flex flex-col gap-[12px]">
      {isAuthenticated ? (
        <Link
          href="/account"
          className="flex items-center justify-center gap-[10px] bg-[#ef6f2e] text-white px-[24px] h-[46px] py-[14px] rounded-[12px] font-normal text-[16px] leading-[1.1]"
          onClick={onClose}
        >
          <div className="relative w-[20px] h-[20px]">
            <Image
              src="/icons/user.svg"
              alt="User"
              fill
              className="object-contain"
            />
          </div>
          <span>{user?.name || "Личный кабинет"}</span>
        </Link>
      ) : (
        <Link
          href="/login"
          className="flex items-center justify-center gap-[10px] bg-[#ef6f2e] text-white px-[24px] h-[46px] py-[14px] rounded-[12px] font-normal text-[16px] leading-[1.1]"
          onClick={onClose}
        >
          <div className="relative w-[20px] h-[20px]">
            <Image
              src="/icons/user.svg"
              alt="User"
              fill
              className="object-contain"
            />
          </div>
          <span>Войти в Личный кабинет</span>
        </Link>
      )}
      <Link
        href="/catalog"
        className="flex items-center justify-center bg-[#131314] text-white px-[24px] h-[46px] py-[14px] rounded-[12px] font-normal text-[16px] leading-[1.1]"
        onClick={onClose}
      >
        Каталог
      </Link>
    </div>
  );
};
