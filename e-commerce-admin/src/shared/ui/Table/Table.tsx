import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

export const Table = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableElement>) => {
  return (
    <div className="w-full overflow-auto">
      <table
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) => {
  return (
    <thead className={cn("bg-secondary-gray", className)} {...props}>
      {children}
    </thead>
  );
};

export const TableBody = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) => {
  return (
    <tbody className={cn("", className)} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) => {
  return (
    <tr
      className={cn(
        "border-b border-gray-100 transition-colors hover:bg-secondary-gray/50",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

export const TableHead = ({
  children,
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) => {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left font-semibold text-primary-black",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
};

export const TableCell = ({
  children,
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) => {
  return (
    <td className={cn("px-4 py-3 text-primary-black", className)} {...props}>
      {children}
    </td>
  );
};
