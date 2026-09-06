import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  variant?: "dark" | "light";
}

export const Logo = ({ variant = "dark" }: LogoProps) => {
  return (
    <Link href="/" className="shrink-0 mt-4" data-nav="logo">
      <Image
        src={variant === "dark" ? "/prime_black.svg" : "/prime.svg"}
        alt="Prime Electronics"
        width={160}
        height={60}
        priority
        className="w-[100px] h-[37.5px] md:w-[100px] md:h-[37.5px] lg:w-[140px] lg:h-[52.5px] xl:w-40 xl:h-[60px]"
      />
    </Link>
  );
};
