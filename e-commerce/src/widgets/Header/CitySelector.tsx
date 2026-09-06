"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

const cities = [
  "Москва",
  "Санкт-Петербург",
  "Новосибирск",
  "Екатеринбург",
  "Казань",
  "Нижний Новгород",
  "Челябинск",
  "Самара",
  "Омск",
  "Ростов-на-Дону",
  "Уфа",
  "Красноярск",
  "Воронеж",
  "Пермь",
  "Волгоград",
];

interface CitySelectorProps {
  isDark?: boolean;
}

export const CitySelector = ({ isDark = false }: CitySelectorProps) => {
  const [selectedCity, setSelectedCity] = useState("Москва");
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-[8px] md:gap-[10px] lg:gap-[12px] xl:gap-[14px] group hover:opacity-80 transition-opacity"
      >
        <div className="w-[14px] h-[14px] md:w-[16px] md:h-[16px] lg:w-[18px] lg:h-[18px] relative">
          <Image
            src={isDark ? "/icons/geo-black.svg" : "/icons/geo-white.svg"}
            alt="Location"
            fill
            className="object-contain"
          />
        </div>
        <span
          className={`font-light text-[12px] md:text-[13px] lg:text-[14px] xl:text-[16px] leading-[1.1] whitespace-nowrap ${
            isDark ? "text-[#131314]" : "text-white"
          }`}
        >
          {selectedCity}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-[8px] bg-white rounded-[12px] shadow-[0px_4px_30px_0px_rgba(19,19,20,0.15)] overflow-hidden z-50 min-w-[280px] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search Input */}
          <div className="p-[12px] border-b border-[rgba(19,19,20,0.1)]">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск города..."
                className="w-full px-[12px] py-[8px] pr-[32px] border border-[rgba(19,19,20,0.16)] rounded-[8px] font-normal text-[14px] leading-[1.3] text-[#131314] placeholder:text-[rgba(19,19,20,0.4)] focus:outline-none focus:border-[#ef6f2e] transition-colors"
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="absolute right-[12px] top-1/2 -translate-y-1/2 pointer-events-none"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="5"
                  stroke="rgba(19,19,20,0.4)"
                  strokeWidth="1.5"
                />
                <path
                  d="M11 11L14 14"
                  stroke="rgba(19,19,20,0.4)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Cities List */}
          <div className="max-h-[300px] overflow-y-auto">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={`w-full px-[16px] py-[10px] text-left font-normal text-[14px] leading-[1.3] transition-colors hover:bg-[rgba(19,19,20,0.04)] whitespace-nowrap ${
                    selectedCity === city
                      ? "text-[#ef6f2e] bg-[rgba(239,111,46,0.05)]"
                      : "text-[#131314]"
                  }`}
                >
                  {city}
                </button>
              ))
            ) : (
              <div className="px-[16px] py-[20px] text-center font-normal text-[14px] leading-[1.3] text-[rgba(19,19,20,0.4)]">
                Город не найден
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
