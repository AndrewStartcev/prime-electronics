interface DeliveryInfoProps {
  pickup: string;
  courier: string;
}

export const DeliveryInfo = ({ pickup, courier }: DeliveryInfoProps) => {
  return (
    <div className="flex flex-col gap-[8px] md:gap-[9px] lg:gap-[8px] xl:gap-[10px]">
      <div className="bg-[#f5f5f7] rounded-[10px] md:rounded-[12px] lg:rounded-[12px] xl:rounded-[14px] p-[10px] md:p-[12px] lg:p-[12px] xl:p-[14px] flex items-start gap-[12px] md:gap-[14px] lg:gap-[14px] xl:gap-[18px] 2xl:gap-[20px]">
        <svg
          className="w-[20px] h-[20px] md:w-[22px] md:h-[22px] lg:w-[20px] lg:h-[20px] xl:w-[22px] xl:h-[22px] 2xl:w-[24px] 2xl:h-[24px] shrink-0"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            fill="#131314"
          />
        </svg>
        <p className="font-normal text-[14px] md:text-[16px] lg:text-[14px] xl:text-[16px] 2xl:text-[18px] leading-[1.3] text-[#131314]">
          <span className="font-medium">Самовывоз по адресу:</span> {pickup}
        </p>
      </div>
      <div className="bg-[#f5f5f7] rounded-[10px] md:rounded-[12px] lg:rounded-[12px] xl:rounded-[14px] p-[10px] md:p-[12px] lg:p-[12px] xl:p-[14px] flex items-start gap-[12px] md:gap-[14px] lg:gap-[14px] xl:gap-[18px] 2xl:gap-[20px]">
        <svg
          className="w-[20px] h-[20px] md:w-[22px] md:h-[22px] lg:w-[20px] lg:h-[20px] xl:w-[22px] xl:h-[22px] 2xl:w-[24px] 2xl:h-[24px] shrink-0"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M18 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM19.5 9.5l1.96 2.5H17V9.5h2.5zM6 18.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM19.5 8H17V4H3c-1.1 0-2 .9-2 2v10h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2V12l-3-4zM3 11V6h12v5H3z"
            fill="#131314"
          />
        </svg>
        <p className="font-normal text-[14px] md:text-[16px] lg:text-[14px] xl:text-[16px] 2xl:text-[18px] leading-[1.3] text-[#131314]">
          <span className="font-medium">Доставка курьером:</span>{" "}
          <span className="text-[#ef6f2e]">{courier}</span>
        </p>
      </div>
    </div>
  );
};
