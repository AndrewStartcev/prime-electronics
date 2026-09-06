"use client";

interface SliderArrowProps {
  direction: "left" | "right";
  onClick: () => void;
  visible: boolean;
  className?: string;
}

export const SliderArrow = ({
  direction,
  onClick,
  visible,
  className = "",
}: SliderArrowProps) => {
  return (
    <button
      onClick={onClick}
      aria-label={direction === "left" ? "Прокрутить назад" : "Прокрутить вперёд"}
      className={`
        hidden md:flex items-center justify-center
        w-[44px] h-[44px] lg:w-[48px] lg:h-[48px] 2xl:w-[52px] 2xl:h-[52px]
        rounded-full bg-white/90 backdrop-blur-sm
        border border-[#131314]/10
        shadow-[0_2px_12px_rgba(0,0,0,0.08)]
        hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:scale-105
        active:scale-95
        transition-all duration-200 ease-out
        z-10 cursor-pointer
        ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
        ${className}
      `}
    >
      <svg
        className="w-5 h-5 lg:w-5.5 lg:h-5.5 2xl:w-6 2xl:h-6 text-[#131314]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        {direction === "left" ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
};
