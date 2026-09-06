import { cn } from "@/shared/lib/utils";

interface DividerProps {
  className?: string;
}

export const Divider = ({ className }: DividerProps) => {
  return (
    <div className={cn("w-full h-[1px] bg-[rgba(19,19,20,0.1)]", className)} />
  );
};
