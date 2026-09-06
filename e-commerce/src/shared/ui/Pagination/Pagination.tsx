"use client";

import { memo, useCallback } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export const Pagination = memo(
  ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    const pages = (() => {
      if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const result: (number | "...")[] = [1];
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        result.push("...");
      }

      for (let page = start; page <= end; page += 1) {
        result.push(page);
      }

      if (end < totalPages - 1) {
        result.push("...");
      }

      result.push(totalPages);

      return result;
    })();

    const handlePageClick = useCallback(
      (page: number) => {
        const nextPage = Math.min(totalPages, Math.max(1, page));
        onPageChange?.(nextPage);
      },
      [onPageChange, totalPages]
    );

    const handlePrevClick = useCallback(() => {
      handlePageClick(currentPage - 1);
    }, [handlePageClick, currentPage]);

    const handleNextClick = useCallback(() => {
      handlePageClick(currentPage + 1);
    }, [handlePageClick, currentPage]);

    const navButtonClass =
      "w-[40px] h-[40px] md:w-[68px] md:h-[68px] rounded-[10px] md:rounded-[14px] border-[0.5px] border-[rgba(19,19,20,0.4)] flex items-center justify-center hover:bg-[rgba(19,19,20,0.05)] transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

    const arrowIcon = (direction: "prev" | "next") => (
      <svg
        width="10"
        height="10"
        viewBox="0 0 12 12"
        fill="none"
        className="md:w-[12px] md:h-[12px]"
      >
        <path
          d={direction === "next" ? "M4.5 9L7.5 6L4.5 3" : "M7.5 9L4.5 6L7.5 3"}
          stroke="#131314"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

    return (
      <div className="flex items-center gap-[10px]">
        <button
          onClick={handlePrevClick}
          disabled={currentPage <= 1}
          aria-label="Предыдущая страница"
          className={navButtonClass}
        >
          {arrowIcon("prev")}
        </button>

        {pages.map((page, index) => (
          page === "..." ? (
            <span
              key={`dots-${index}`}
              className="w-[24px] md:w-[32px] h-[40px] md:h-[68px] flex items-center justify-center text-[16px] md:text-[18px] text-[#131314]"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`w-[40px] h-[40px] md:w-[68px] md:h-[68px] rounded-[10px] md:rounded-[14px] flex items-center justify-center font-normal text-[16px] md:text-[18px] leading-[1.3] transition-colors ${
                currentPage === page
                  ? "bg-[#ef6f2e] text-white"
                  : "border-[0.5px] border-[rgba(19,19,20,0.4)] text-[#131314] hover:bg-[rgba(19,19,20,0.05)]"
              }`}
            >
              {page}
            </button>
          )
        ))}

        <button
          onClick={handleNextClick}
          disabled={currentPage >= totalPages}
          aria-label="Следующая страница"
          className={navButtonClass}
        >
          {arrowIcon("next")}
        </button>
      </div>
    );
  }
);

Pagination.displayName = "Pagination";
