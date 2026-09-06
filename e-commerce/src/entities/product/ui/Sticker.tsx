import { memo } from "react";

interface StickerProps {
  type: "new" | "sale";
}

export const Sticker = memo(({ type }: StickerProps) => {
  const stickerClass =
    type === "new"
      ? "bg-white text-[#131314] border border-[rgba(19,19,20,0.08)]"
      : "bg-[#ef6f2e] text-white border border-[#ef6f2e]";

  return (
    <div
      className={`absolute top-[10px] left-[10px] md:top-[14px] md:left-[14px] lg:top-[10px] lg:left-[10px] xl:top-[14px] xl:left-[14px] 2xl:top-[20px] 2xl:left-[16px] px-[10px] py-[6px] md:px-[12px] md:py-[8px] lg:px-[8px] lg:py-[5px] xl:px-[10px] xl:py-[6px] 2xl:px-[14px] 2xl:py-[10px] rounded-[40px] shadow-[0_8px_24px_rgba(19,19,20,0.12)] ${stickerClass}`}
    >
      <p className="font-normal text-[12px] md:text-[14px] lg:text-[11px] xl:text-[13px] 2xl:text-[16px] leading-[1.4] whitespace-nowrap">
        {type === "new" ? "Новинка" : "Акция"}
      </p>
    </div>
  );
});

Sticker.displayName = "Sticker";
