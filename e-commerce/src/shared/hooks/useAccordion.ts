import { useState, useCallback } from "react";

interface UseAccordionReturn {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

export const useAccordion = (defaultOpen = false): UseAccordionReturn => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return {
    isOpen,
    toggle,
    open,
    close,
  };
};
