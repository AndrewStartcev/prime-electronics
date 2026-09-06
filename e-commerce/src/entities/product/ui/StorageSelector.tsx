import { cn } from "@/shared/lib/utils";

interface StorageSelectorProps {
  label?: string;
  storageOptions: string[];
  selectedStorage: string;
  onStorageSelect: (storage: string) => void;
}

export const StorageSelector = ({
  label = "Встроенная память",
  storageOptions,
  selectedStorage,
  onStorageSelect,
}: StorageSelectorProps) => {
  // Don't render if no storage options available
  if (!storageOptions || storageOptions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-[12px] md:gap-[18px] lg:gap-[24px]">
      <span className="font-medium text-[14px] md:text-[16px] lg:text-[18px] leading-[1.1] text-[#131314]">
        {label}
      </span>
      <div className="flex items-center gap-[6px] md:gap-[8px] lg:gap-[10px]">
        {storageOptions.map((storage) => (
          <button
            key={storage}
            onClick={() => onStorageSelect(storage)}
            className={cn(
              "px-[8px] py-[8px] md:px-[9px] md:py-[9px] lg:px-[10px] lg:py-[10px] rounded-[6px] md:rounded-[7px] lg:rounded-[8px] border transition-all",
              selectedStorage === storage
                ? "border-[#131314] font-medium text-[#131314]"
                : "border-[rgba(19,19,20,0.16)] text-[rgba(19,19,20,0.4)]",
            )}
          >
            <span className="text-[14px] md:text-[16px] lg:text-[18px] leading-[1.1]">
              {storage}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
