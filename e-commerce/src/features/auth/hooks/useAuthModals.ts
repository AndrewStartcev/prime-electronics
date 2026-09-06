import { useState, useCallback } from "react";

type ModalType = "login" | "register" | null;

interface UseAuthModalsReturn {
  activeModal: ModalType;
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  openLogin: () => void;
  openRegister: () => void;
  closeModals: () => void;
  switchToLogin: () => void;
  switchToRegister: () => void;
}

export const useAuthModals = (): UseAuthModalsReturn => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openLogin = useCallback(() => setActiveModal("login"), []);
  const openRegister = useCallback(() => setActiveModal("register"), []);
  const closeModals = useCallback(() => setActiveModal(null), []);

  const switchToLogin = useCallback(() => setActiveModal("login"), []);
  const switchToRegister = useCallback(() => setActiveModal("register"), []);

  return {
    activeModal,
    isLoginOpen: activeModal === "login",
    isRegisterOpen: activeModal === "register",
    openLogin,
    openRegister,
    closeModals,
    switchToLogin,
    switchToRegister,
  };
};
