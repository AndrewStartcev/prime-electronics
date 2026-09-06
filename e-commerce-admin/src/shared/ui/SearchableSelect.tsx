"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";

export type SearchableSelectOption = {
  value: string;
  label: string;
  description?: string;
  image?: string | null;
  keywords?: string;
};

type SearchableSelectProps = {
  label?: string;
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  emptyValueLabel?: string;
  emptyOptionLabel?: string;
  emptyOptionDescription?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  showImages?: boolean;
  className?: string;
};

function normalizeSearchValue(value: string) {
  return value.toLowerCase().replace(/ё/g, "е").trim();
}

export function SearchableSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Начните вводить название",
  emptyLabel = "Ничего не найдено",
  emptyValueLabel,
  emptyOptionLabel,
  emptyOptionDescription,
  error,
  helperText,
  disabled,
  required,
  showImages = false,
  className = "",
}: SearchableSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);
    if (!normalizedQuery) return options.slice(0, 80);

    return options
      .filter((option) => {
        const labelText = normalizeSearchValue(option.label);
        const descriptionText = normalizeSearchValue(option.description || "");
        const keywordsText = normalizeSearchValue(option.keywords || "");
        return (
          labelText.includes(normalizedQuery) ||
          descriptionText.includes(normalizedQuery) ||
          keywordsText.includes(normalizedQuery)
        );
      })
      .slice(0, 80);
  }, [options, query]);

  const emptyOptionMatches = useMemo(() => {
    if (!emptyOptionLabel) return false;

    const normalizedQuery = normalizeSearchValue(query);
    if (!normalizedQuery) return true;

    return normalizeSearchValue(
      `${emptyOptionLabel} ${emptyOptionDescription || ""}`,
    ).includes(normalizedQuery);
  }, [emptyOptionDescription, emptyOptionLabel, query]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const inputValue = isOpen
    ? query
    : selectedOption?.label || emptyValueLabel || "";

  const shouldShowMediaColumn =
    showImages || filteredOptions.some((option) => Boolean(option.image));

  const renderOptionContent = (option: SearchableSelectOption) => (
    <span className="flex min-w-0 items-center gap-3">
      {shouldShowMediaColumn && (
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-secondary-gray bg-cover bg-center text-xs font-medium text-text-secondary-black"
          style={
            option.image ? { backgroundImage: `url(${option.image})` } : undefined
          }
          aria-hidden="true"
        >
          {!option.image && option.label.trim().slice(0, 1)}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate font-medium">{option.label}</span>
        {option.description && (
          <span className="mt-0.5 block truncate text-xs text-text-secondary-black">
            {option.description}
          </span>
        )}
      </span>
    </span>
  );

  return (
    <div ref={rootRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-primary-black mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary-black" />
        <input
          type="text"
          role="combobox"
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          disabled={disabled}
          value={inputValue}
          placeholder={placeholder}
          onFocus={() => {
            setIsOpen(true);
            setQuery("");
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpen(false);
              setQuery("");
            }
            if (
              event.key === "Enter" &&
              isOpen &&
              (emptyOptionMatches || filteredOptions[0])
            ) {
              event.preventDefault();
              onChange(emptyOptionMatches ? "" : filteredOptions[0].value);
              setIsOpen(false);
              setQuery("");
            }
          }}
          className={`w-full rounded-xl border bg-white py-2.5 pl-9 pr-10 text-sm text-primary-black transition-all focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange/20 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            error ? "border-red-500" : "border-gray-200"
          }`}
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-2 top-1/2 rounded-lg p-1.5 text-text-secondary-black transition-colors hover:bg-secondary-gray hover:text-primary-black"
            aria-label="Очистить выбор"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && !disabled && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          {emptyOptionMatches && emptyOptionLabel && (
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange("");
                setIsOpen(false);
                setQuery("");
              }}
              className={`block w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary-gray ${
                !value
                  ? "bg-primary-orange/10 text-primary-black"
                  : "text-primary-black"
              }`}
            >
              {renderOptionContent({
                value: "",
                label: emptyOptionLabel,
                description: emptyOptionDescription,
              })}
            </button>
          )}
          {filteredOptions.length === 0 && !emptyOptionMatches ? (
            <div className="px-3 py-3 text-sm text-text-secondary-black">
              {emptyLabel}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setQuery("");
                }}
                className={`block w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary-gray ${
                  option.value === value
                    ? "bg-primary-orange/10 text-primary-black"
                    : "text-primary-black"
                }`}
              >
                {renderOptionContent(option)}
              </button>
            ))
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-text-secondary-black">{helperText}</p>
      )}
    </div>
  );
}
