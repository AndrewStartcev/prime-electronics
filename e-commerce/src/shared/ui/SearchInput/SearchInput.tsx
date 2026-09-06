import { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  onSearch?: (value: string) => void;
}

export const SearchInput = ({
  placeholder = "Искать: Iphone 17 pro",
  onSearch,
  className,
  ...props
}: SearchInputProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-[20px] px-6 py-6 border-[0.5px] border-[rgba(255,255,255,0.4)] rounded-[60px]",
        className
      )}
    >
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none font-light text-[18px] leading-[1.1] text-[rgba(255,255,255,0.4)] placeholder:text-[rgba(255,255,255,0.4)]"
        {...props}
      />
      <button
        type="button"
        className="w-5 h-5 flex items-center justify-center"
        aria-label="Search"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M14.1667 12.5H13.3917L13.1 12.2167C14.1 11.05 14.7083 9.53333 14.7083 7.85417C14.7083 4.09167 11.6167 1 7.85417 1C4.09167 1 1 4.09167 1 7.85417C1 11.6167 4.09167 14.7083 7.85417 14.7083C9.53333 14.7083 11.05 14.1 12.2167 13.1L12.5 13.3917V14.1667L17.7083 19.375L19.375 17.7083L14.1667 12.5ZM7.85417 12.5C5.30833 12.5 3.20833 10.4 3.20833 7.85417C3.20833 5.30833 5.30833 3.20833 7.85417 3.20833C10.4 3.20833 12.5 5.30833 12.5 7.85417C12.5 10.4 10.4 12.5 7.85417 12.5Z"
            fill="white"
          />
        </svg>
      </button>
    </div>
  );
};
