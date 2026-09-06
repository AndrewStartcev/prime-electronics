import { cn } from "@/shared/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "relative z-10 flex items-center gap-[4px] md:gap-[6px] flex-wrap pointer-events-auto",
        className
      )}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className="relative z-10 flex items-center gap-[4px] md:gap-[6px]"
        >
          {item.href && index !== items.length - 1 ? (
            <a
              href={item.href}
              className="inline-flex font-normal text-[12px] md:text-[16px] leading-[1.4] text-[rgba(19,19,20,0.4)] hover:text-[#131314] transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="font-normal text-[12px] md:text-[16px] leading-[1.4] text-[rgba(19,19,20,0.4)]">
              {item.label}
            </span>
          )}
          {index < items.length - 1 && (
            <svg
              width="8"
              height="8"
              viewBox="0 0 10 10"
              fill="none"
              className="transform -rotate-90 md:w-[10px] md:h-[10px]"
            >
              <path
                d="M2.5 3.75L5 6.25L7.5 3.75"
                stroke="rgba(19,19,20,0.4)"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      ))}
    </nav>
  );
};
