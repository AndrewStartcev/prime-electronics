"use client";

import { Button } from "./Button";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total?: number;
  label?: string;
}

export const TablePagination = ({
  page,
  totalPages,
  onPageChange,
  total,
  label = "записей",
}: TablePaginationProps) => {
  if (totalPages <= 1) return null;

  // Show max 7 page buttons with ellipsis
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [1];

    if (page > 3) {
      pages.push("...");
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
      <p className="text-sm text-text-secondary-black">
        Страница {page} из {totalPages}
        {total !== undefined && ` • ${total} ${label}`}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Назад
        </Button>
        {getPageNumbers().map((num, i) =>
          num === "..." ? (
            <span
              key={`dots-${i}`}
              className="px-2 text-sm text-text-secondary-black"
            >
              ...
            </span>
          ) : (
            <Button
              key={num}
              variant={num === page ? "primary" : "outline"}
              size="sm"
              onClick={() => onPageChange(num)}
            >
              {num}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Вперед
        </Button>
      </div>
    </div>
  );
};
