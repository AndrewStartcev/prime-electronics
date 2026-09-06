import Image from "next/image";

interface SocialIconProps {
  name: "telegram" | "whatsapp" | "instagram" | "vk" | "max";
  href: string;
  size?: number;
}

export const SocialIcon = ({ name, href, size = 40 }: SocialIconProps) => {
  const iconPaths = {
    telegram: "/icons/telegram.svg",
    whatsapp: "/icons/whatsapp.svg",
    instagram: "/icons/instagram.svg",
    vk: "/icons/vk.svg",
    max: "/icons/max-mono.svg",
  };
  const iconSize = 14;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`bg-[rgba(255,255,255,0.06)] rounded-[10px] md:rounded-[6px] flex items-center justify-center hover:bg-[rgba(255,255,255,0.12)] transition-colors`}
      style={{ width: size, height: size }}
      aria-label={name}
    >
      <Image
        src={iconPaths[name]}
        alt={name}
        width={iconSize}
        height={iconSize}
        style={{ width: iconSize, height: iconSize }}
      />
    </a>
  );
};
