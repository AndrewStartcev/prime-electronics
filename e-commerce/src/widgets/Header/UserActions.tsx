"use client";

import { RegisterModal } from "@/features/auth";
import { useAuthModals } from "@/features/auth/hooks";
import { MobileActions } from "./ui/MobileActions";
import { DesktopActions } from "./ui/DesktopActions";

interface UserActionsProps {
  variant?: "desktop" | "mobile";
  onMenuClick?: () => void;
  isDark?: boolean;
}

export const UserActions = ({
  variant = "desktop",
  onMenuClick,
  isDark = false,
}: UserActionsProps) => {
  const {
    isRegisterOpen,
    openRegister,
    closeModals,
  } = useAuthModals();

  if (variant === "mobile") {
    return (
      <>
        <MobileActions onMenuClick={onMenuClick} isDark={isDark} />
        <RegisterModal
          isOpen={isRegisterOpen}
          onClose={closeModals}
        />
      </>
    );
  }

  return (
    <>
      <DesktopActions onProfileClick={openRegister} isDark={isDark} />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={closeModals}
      />
    </>
  );
};
