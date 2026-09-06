import { useState, useCallback, useRef, useEffect } from "react";

interface UseDropdownOptions<T> {
  initialValue: T;
  onSelect?: (value: T) => void;
  closeOnSelect?: boolean;
}

interface UseDropdownReturn<T> {
  selected: T;
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  select: (value: T) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export const useDropdown = <T>({
  initialValue,
  onSelect,
  closeOnSelect = true,
}: UseDropdownOptions<T>): UseDropdownReturn<T> => {
  const [selected, setSelected] = useState<T>(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const select = useCallback(
    (value: T) => {
      setSelected(value);
      onSelect?.(value);
      if (closeOnSelect) {
        setIsOpen(false);
      }
    },
    [onSelect, closeOnSelect]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return {
    selected,
    isOpen,
    toggle,
    open,
    close,
    select,
    dropdownRef,
  };
};
