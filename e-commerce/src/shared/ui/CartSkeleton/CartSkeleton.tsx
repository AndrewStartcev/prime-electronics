export const CartSkeleton = () => {
  return (
    <div className="space-y-[16px] md:space-y-[20px]">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex gap-[12px] md:gap-[16px] p-[12px] md:p-[16px] bg-white rounded-[12px] md:rounded-[14px] border border-[rgba(19,19,20,0.08)] animate-pulse"
        >
          {/* Image skeleton */}
          <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] lg:w-[120px] lg:h-[120px] bg-[#f5f5f7] rounded-[8px] md:rounded-[10px] shrink-0" />

          {/* Content skeleton */}
          <div className="flex-1 flex flex-col justify-between py-[4px]">
            <div className="space-y-[8px]">
              <div className="h-[16px] md:h-[18px] bg-[#f5f5f7] rounded-[4px] w-3/4" />
              <div className="h-[14px] md:h-[16px] bg-[#f5f5f7] rounded-[4px] w-1/2" />
            </div>
            <div className="flex justify-between items-end mt-[8px]">
              <div className="h-[20px] md:h-[24px] bg-[#f5f5f7] rounded-[4px] w-[80px] md:w-[100px]" />
              <div className="h-[36px] md:h-[40px] bg-[#f5f5f7] rounded-[8px] w-[100px] md:w-[120px]" />
            </div>
          </div>

          {/* Remove button skeleton */}
          <div className="w-[32px] h-[32px] md:w-[36px] md:h-[36px] bg-[#f5f5f7] rounded-[6px] md:rounded-[8px] shrink-0" />
        </div>
      ))}
    </div>
  );
};
