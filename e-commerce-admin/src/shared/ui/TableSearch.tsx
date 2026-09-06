"use client";

interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const TableSearch = ({
  value,
  onChange,
  placeholder = "Поиск...",
}: TableSearchProps) => {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-primary-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange"
      />
    </div>
  );
};
