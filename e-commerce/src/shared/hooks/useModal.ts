import { useState, useCallback, useEffect, useRef } from "react";

interface UseModalOptions {
  onClose: () => void;
  animationDuration?: number;
}

interface UseModalReturn {
  isVisible: boolean;
  isClosing: boolean;
  handleClose: () => void;
  handleBackdropClick: (e: React.MouseEvent) => void;
}

export const useModal = (
  isOpen: boolean,
  { onClose, animationDuration = 150 }: UseModalOptions
): UseModalReturn => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle open/close animations
  useEffect(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
    } else if (isVisible) {
      // If modal is visible and isOpen becomes false, trigger close animation
      setIsClosing(true);
      closeTimerRef.current = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
        closeTimerRef.current = null;
      }, animationDuration);
    }

    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isOpen, isVisible, animationDuration]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  return {
    isVisible,
    isClosing,
    handleClose,
    handleBackdropClick,
  };
};
