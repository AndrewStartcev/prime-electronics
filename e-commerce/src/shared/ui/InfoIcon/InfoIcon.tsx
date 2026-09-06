interface InfoIconProps {
  onClick?: () => void;
}

export const InfoIcon = ({ onClick }: InfoIconProps) => {
  return (
    <button
      onClick={onClick}
      className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] lg:w-[20px] lg:h-[20px] text-[rgba(19,19,20,0.4)] hover:text-[#131314] transition-colors"
    >
      <svg className="w-full h-full" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10 9V14M10 6V7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
};
