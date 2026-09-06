import Image from "next/image";
import { ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  alt: string;
  variant?: "default" | "bordered";
  size?: "sm" | "md" | "lg";
  isDark?: boolean;
  width?: number;
  height?: number;
}

export const IconButton = ({
  icon,
  alt,
  variant = "default",
  size = "md",
  isDark = false,
  width,
  height,
  className = "",
  ...props
}: IconButtonProps) => {
  const sizeClasses = {
    sm: "w-[18px] h-[18px] md:w-5 md:h-5 lg:w-6 lg:h-6",
    md: "w-5 h-5",
    lg: "w-[48px] h-[48px] md:w-[56px] md:h-[56px]",
  };

  const iconSizeClasses = {
    sm: "",
    md: "",
    lg: "w-[20px] h-[20px] md:w-[24px] md:h-[24px]",
  };

  const variantClasses = {
    default: "hover:scale-110 transition-transform",
    bordered:
      "flex items-center justify-center rounded-[12px]  hover:bg-gray-50 transition-colors",
  };

  return (
    <button
      className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <Image
        src={icon}
        alt={alt}
        width={width || 24}
        height={height || 24}
        className={iconSizeClasses[size]}
      />
    </button>
  );
};
