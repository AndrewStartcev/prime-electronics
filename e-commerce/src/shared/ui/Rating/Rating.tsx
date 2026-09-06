interface RatingProps {
  rating: number;
  reviewsCount: number;
}

export const Rating = ({ rating, reviewsCount }: RatingProps) => {
  return (
    <div className="flex items-center gap-[10px] md:gap-[12px] lg:gap-[14px]">
      <div className="flex items-center gap-[4px] md:gap-[5px] lg:gap-[6px]">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className="w-[14px] h-[14px] md:w-[16px] md:h-[16px] lg:w-[18px] lg:h-[18px] xl:w-[20px] xl:h-[20px]"
            viewBox="0 0 20 20"
            fill={star <= Math.floor(rating) ? "#ef6f2e" : "none"}
            stroke={
              star <= Math.floor(rating) ? "#ef6f2e" : "rgba(19,19,20,0.16)"
            }
          >
            <path d="M10 1l2.245 6.91h7.255l-5.873 4.27 2.245 6.91L10 14.82l-5.872 4.27 2.245-6.91L.5 7.91h7.255L10 1z" />
          </svg>
        ))}
      </div>
      <span className="font-normal text-[14px] md:text-[16px] lg:text-[18px] leading-[1.1] text-[#131314]">
        {rating.toFixed(1)}{" "}
        <span className="text-[rgba(19,19,20,0.4)]">({reviewsCount})</span>
      </span>
    </div>
  );
};
