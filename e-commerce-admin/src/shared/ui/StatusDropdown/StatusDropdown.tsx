"use client";

import { useState, useRef, useEffect } from "react";
import { OrderStatus, orderStatusLabels } from "@/entities/order/model/types";

interface StatusDropdownProps {
  value: OrderStatus | "";
  onChange: (value: OrderStatus) => void;
  currentStatus?: OrderStatus;
  disabledStatusReasons?: Partial<Record<OrderStatus, string>>;
}

export const StatusDropdown = ({
  value,
  onChange,
  currentStatus,
  disabledStatusReasons,
}: StatusDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statusIcons: Record<OrderStatus, string> = {
    PENDING: "⏳",
    PROCESSING: "🔄",
    CONFIRMED: "✔️",
    PAYED: "✅",
    ASSEMBLED: "📋",
    SHIPPED: "🚚",
    DELIVERED: "🎉",
    CANCELLED: "❌",
  };

  const handleSelect = (status: OrderStatus) => {
    onChange(status);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-secondary-gray/30 transition-colors text-sm font-medium text-primary-black min-w-[200px]"
      >
        <svg
          className="w-4 h-4 text-primary-orange"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span className="flex-1 text-left">
          {value ? orderStatusLabels[value] : "Изменить статус"}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 max-h-[400px] overflow-y-auto">
          {(Object.keys(orderStatusLabels) as OrderStatus[]).map((status) => {
            const isCurrentStatus = status === currentStatus;
            const isSelected = status === value;
            const disabledReason = disabledStatusReasons?.[status];
            const isDisabled = isCurrentStatus || Boolean(disabledReason);

            return (
              <button
                key={status}
                type="button"
                onClick={() => !isDisabled && handleSelect(status)}
                disabled={isDisabled}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                  ${isDisabled ? "bg-secondary-gray/30 cursor-not-allowed opacity-60" : "hover:bg-secondary-gray/50 cursor-pointer"}
                  ${isSelected ? "bg-primary-orange/10" : ""}
                `}
              >
                <span className="text-xl">{statusIcons[status]}</span>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${isDisabled ? "text-text-secondary-black" : "text-primary-black"}`}
                  >
                    {orderStatusLabels[status]}
                  </p>
                  {isCurrentStatus && (
                    <p className="text-xs text-text-secondary-black mt-0.5">
                      Текущий статус
                    </p>
                  )}
                  {!isCurrentStatus && disabledReason && (
                    <p className="text-xs text-text-secondary-black mt-0.5">
                      {disabledReason}
                    </p>
                  )}
                </div>
                {isSelected && !isCurrentStatus && (
                  <svg
                    className="w-5 h-5 text-primary-orange"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
