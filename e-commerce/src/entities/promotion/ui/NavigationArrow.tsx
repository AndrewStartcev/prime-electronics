export const NavigationArrow = () => {
  return (
    <div className="absolute bottom-[60px] left-[60px] w-[40px] h-[40px] border border-white rounded-full flex items-center justify-center group-hover:bg-white/10 transition-colors">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 3.33L8.83 4.5L13.47 9.17H3.33V10.83H13.47L8.83 15.5L10 16.67L16.67 10L10 3.33Z"
          fill="white"
        />
      </svg>
    </div>
  );
};
