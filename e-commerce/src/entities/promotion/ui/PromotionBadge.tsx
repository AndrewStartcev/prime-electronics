interface PromotionBadgeProps {
  type: "trade-in" | "cashback" | "promo";
}

const badgeStyles = {
  "trade-in": "bg-[#ef6f2e] text-white",
  cashback: "bg-[#131314] text-white",
  promo: "bg-white text-[#131314]",
};

const badgeText = {
  "trade-in": "Трейд-ин",
  cashback: "Кешбэк",
  promo: "Акция",
};

export const PromotionBadge = ({ type }: PromotionBadgeProps) => {
  return (
    <div
      className={`inline-flex items-center px-6 py-[14px] rounded-[60px] border border-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.12)] w-fit ${badgeStyles[type]}`}
    >
      <span className="font-light text-[18px] leading-[1.1]">
        {badgeText[type]}
      </span>
    </div>
  );
};
