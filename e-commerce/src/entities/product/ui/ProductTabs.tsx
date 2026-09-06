"use client";

import { memo, useState } from "react";
import { cn } from "@/shared/lib/utils";
import { ProductDetail } from "../model";
import { useTabs } from "@/shared/hooks";
import { reviewApi } from "@/shared/api";
import { useAuthStore } from "@/shared/stores/useAuthStore";
import { isAxiosError } from "axios";
import { Star } from "lucide-react";

interface ProductTabsProps {
  product: ProductDetail;
}

type TabType = "specs" | "reviews";

const tabs: { id: TabType; label: string }[] = [
  { id: "specs", label: "Характеристики" },
  { id: "reviews", label: "Отзывы" },
];

const RATING_LABELS = [
  "Очень плохо",
  "Плохо",
  "Нормально",
  "Хорошо",
  "Отлично",
];

const getReviewsLabel = (count: number) => {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastDigit === 1 && lastTwoDigits !== 11) return `${count} отзыв`;
  if (
    lastDigit >= 2 &&
    lastDigit <= 4 &&
    (lastTwoDigits < 12 || lastTwoDigits > 14)
  ) {
    return `${count} отзыва`;
  }

  return `${count} отзывов`;
};

export const ProductTabs = memo(({ product }: ProductTabsProps) => {
  const { activeTab, setActiveTab, isActive } = useTabs<TabType>("specs");

  return (
    <div className="w-full mt-[30px] md:mt-[40px] lg:mt-[50px] xl:mt-[60px]">
      <div className="flex items-center gap-[6px] md:gap-[8px] lg:gap-[10px] overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-[16px] py-[10px] md:px-[24px] md:py-[14px] lg:px-[30px] lg:py-[18px] xl:px-[34px] xl:py-[20px] font-normal text-[14px] md:text-[16px] lg:text-[18px] leading-[1.1] transition-all rounded-[10px] md:rounded-[11px] lg:rounded-[12px] whitespace-nowrap flex-shrink-0",
              isActive(tab.id)
                ? "bg-[#ef6f2e] text-white"
                : "bg-[#f5f5f7] text-[#131314] hover:bg-[#ebebed]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-[24px] md:mt-[30px] lg:mt-[36px] xl:mt-[40px]">
        {activeTab === "specs" && (
          <SpecsTab specifications={product.specifications} />
        )}
        {activeTab === "reviews" && (
          <ReviewsTab
            productId={product.id}
            rating={product.rating}
            reviewsCount={product.reviewsCount}
            reviews={product.reviews || []}
          />
        )}
      </div>
    </div>
  );
});

ProductTabs.displayName = "ProductTabs";

const SpecRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="grid grid-cols-1 min-[520px]:grid-cols-[minmax(160px,38%)_minmax(0,1fr)] items-start gap-y-[6px] gap-x-[16px] md:gap-x-[20px] py-[14px] md:py-[16px] border-b border-[rgba(19,19,20,0.08)]">
    <span className="min-w-0 font-medium text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] leading-[1.22] text-[rgba(19,19,20,0.34)] break-words">
      {label}
    </span>
    <span className="min-w-0 font-medium text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] leading-[1.22] text-[#131314] break-words">
      {value}
    </span>
  </div>
);

SpecRow.displayName = "SpecRow";

const SpecCell = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="min-w-0 grid grid-cols-[minmax(180px,36%)_minmax(0,1fr)] xl:grid-cols-[minmax(200px,35%)_minmax(0,1fr)] items-start gap-x-[22px] py-[18px] xl:py-[20px]">
    <span className="min-w-0 font-medium text-[16px] xl:text-[17px] leading-[1.22] text-[rgba(19,19,20,0.34)] break-words">
      {label}
    </span>
    <span className="min-w-0 font-medium text-[16px] xl:text-[17px] leading-[1.22] text-[#131314] break-words">
      {value}
    </span>
  </div>
);

SpecCell.displayName = "SpecCell";

// Specifications Tab - Two columns like in Figma design (single column on mobile)
const SpecsTab = memo(
  ({ specifications }: { specifications: ProductDetail["specifications"] }) => {
    const desktopRows = Array.from(
      { length: Math.ceil(specifications.length / 2) },
      (_, index) => [
        specifications[index * 2],
        specifications[index * 2 + 1],
      ],
    );

    return (
      <>
        {/* Mobile: Single column */}
        <div className="grid grid-cols-1 lg:hidden">
          {specifications.map((spec, index) => (
            <SpecRow
              key={index}
              label={spec.label}
              value={spec.value}
            />
          ))}
        </div>

        {/* Desktop: paired rows keep both columns aligned */}
        <div className="hidden lg:grid grid-cols-1">
          {desktopRows.map(([leftSpec, rightSpec], index) => (
            <div
              key={index}
              className="grid grid-cols-2 gap-x-[36px] xl:gap-x-[56px] 2xl:gap-x-[80px] border-b border-[rgba(19,19,20,0.08)]"
            >
              <SpecCell label={leftSpec.label} value={leftSpec.value} />
              {rightSpec ? (
                <SpecCell label={rightSpec.label} value={rightSpec.value} />
              ) : (
                <div aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </>
    );
  },
);

SpecsTab.displayName = "SpecsTab";

// Reviews Tab - according to Figma design (mobile responsive)
const ReviewsTab = ({
  productId,
  rating,
  reviewsCount,
  reviews: initialReviews,
}: {
  productId: string;
  rating: number;
  reviewsCount: number;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    guestName?: string | null;
    user: { id: string; name: string } | null;
  }>;
}) => {
  const { isAuthenticated } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reviews, setReviews] = useState(initialReviews);
  const [currentRating, setCurrentRating] = useState(rating);
  const [currentReviewsCount, setCurrentReviewsCount] = useState(reviewsCount);

  const handleSubmit = async () => {
    if (reviewRating === 0) {
      setRatingError(true);
      setSubmitError(null);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let newReview;

      if (isAuthenticated) {
        // Authenticated user review
        newReview = await reviewApi.create({
          productId,
          rating: reviewRating,
          comment: reviewText || undefined,
        });
      } else {
        // Guest review
        newReview = await reviewApi.createGuestReview({
          productId,
          rating: reviewRating,
          comment: reviewText || undefined,
        });
      }

      // Add the new review to the list
      setReviews((prev) => [
        {
          id: newReview.id,
          rating: newReview.rating,
          comment: newReview.comment,
          createdAt: newReview.createdAt,
          guestName: newReview.guestName,
          user: newReview.user,
        },
        ...prev,
      ]);

      // Update rating and count
      const newCount = currentReviewsCount + 1;
      const newRating =
        (currentRating * currentReviewsCount + reviewRating) / newCount;
      setCurrentRating(newRating);
      setCurrentReviewsCount(newCount);

      // Reset form
      setShowForm(false);
      setReviewRating(0);
      setReviewText("");
      setRatingError(false);
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setSubmitError("Вы уже оставили отзыв на этот товар");
      } else {
        setSubmitError("Ошибка при отправке отзыва. Попробуйте позже.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWriteReviewClick = () => {
    setSubmitError(null);
    setRatingError(false);
    setShowForm(true);
  };

  const handleRatingSelect = (value: number) => {
    setReviewRating(value);
    setRatingError(false);
  };

  return (
    <div className="flex flex-col gap-[24px] md:gap-[30px] lg:gap-[40px]">
      {/* Error message */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[10px] text-[14px] md:text-[16px]">
          {submitError}
        </div>
      )}

      {/* Title */}
      <h3 className="font-medium text-[18px] md:text-[20px] lg:text-[22px] xl:text-[24px] leading-[1.2] text-[#131314]">
        Отзывы покупателей об этом товаре
      </h3>

      {/* Product rating summary */}
      <div className="flex items-center gap-[12px] md:gap-[14px]">
        <div className="flex size-[42px] md:size-[48px] items-center justify-center rounded-full bg-[#fff1e9] text-[#ef6f2e]">
          <Star className="size-[20px] md:size-[23px]" fill="currentColor" />
        </div>
        <div className="flex flex-col gap-[2px]">
          <span className="text-[13px] md:text-[14px] leading-[1.2] text-[rgba(19,19,20,0.56)]">
            Средняя оценка товара
          </span>
          <span className="font-medium text-[20px] md:text-[22px] leading-[1.2] text-[#131314]">
            {currentRating.toFixed(1)} из 5
            <span className="ml-[8px] font-normal text-[14px] md:text-[16px] text-[rgba(19,19,20,0.48)]">
              {currentReviewsCount > 0
                ? getReviewsLabel(currentReviewsCount)
                : "Пока нет отзывов"}
            </span>
          </span>
        </div>
      </div>

      {showForm && (
        <div className="flex flex-col gap-[20px] rounded-[14px] md:rounded-[16px] border border-[rgba(19,19,20,0.1)] bg-white p-[16px] md:p-[24px] lg:p-[28px]">
          <div>
            <h4 className="font-medium text-[18px] md:text-[20px] leading-[1.2] text-[#131314]">
              Напишите отзыв
            </h4>
            <p className="mt-[5px] text-[14px] md:text-[15px] leading-[1.4] text-[rgba(19,19,20,0.56)]">
              Расскажите о впечатлениях и обязательно выберите оценку.
            </p>
          </div>

          <div className="flex flex-col gap-[8px]">
            <label
              htmlFor="review-comment"
              className="font-medium text-[14px] md:text-[16px] text-[#131314]"
            >
              Ваш отзыв
            </label>
            <textarea
              id="review-comment"
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              maxLength={200}
              placeholder="Что вам понравилось или не понравилось?"
              className="h-[130px] md:h-[150px] w-full resize-none rounded-[12px] bg-[#f5f5f7] p-[16px] font-normal text-[14px] md:text-[16px] leading-[1.45] text-[#131314] placeholder:text-[rgba(19,19,20,0.48)] focus:outline-none focus:ring-2 focus:ring-[#ef6f2e] focus:ring-offset-1"
            />
            <p className="text-right text-[12px] md:text-[13px] leading-[1.3] text-[rgba(19,19,20,0.56)]">
              {reviewText.length}/200 символов
            </p>
          </div>

          <div className="flex flex-col gap-[10px]">
            <div>
              <p
                id="review-rating-label"
                className="font-medium text-[14px] md:text-[16px] text-[#131314]"
              >
                Ваша оценка <span className="text-[#d94f10]">*</span>
              </p>
              <p className="mt-[3px] text-[12px] md:text-[13px] text-[rgba(19,19,20,0.56)]">
                Выберите один вариант от 1 до 5.
              </p>
            </div>

            <div
              role="radiogroup"
              aria-labelledby="review-rating-label"
              aria-invalid={ratingError}
              className="grid grid-cols-5 gap-[6px] md:max-w-[520px] md:gap-[10px]"
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const isHighlighted = star <= (hoverRating || reviewRating);
                const isSelected = star === reviewRating;

                return (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`${star} из 5 — ${RATING_LABELS[star - 1]}`}
                    onClick={() => handleRatingSelect(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={cn(
                      "flex min-h-[52px] items-center justify-center gap-[4px] rounded-[10px] border text-[15px] font-medium transition-colors active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#ef6f2e] focus:ring-offset-2 md:min-h-[58px] md:gap-[7px] md:text-[17px]",
                      isSelected
                        ? "border-[#ef6f2e] bg-[#fff1e9] text-[#c94f14]"
                        : "border-[rgba(19,19,20,0.12)] bg-white text-[#131314] hover:border-[#ef6f2e] hover:bg-[#fff8f4]",
                    )}
                  >
                    <span>{star}</span>
                    <Star
                      className={cn(
                        "size-[16px] md:size-[18px]",
                        isHighlighted
                          ? "text-[#ef6f2e]"
                          : "text-[rgba(19,19,20,0.28)]",
                      )}
                      fill={isHighlighted ? "currentColor" : "none"}
                    />
                  </button>
                );
              })}
            </div>

            {ratingError ? (
              <p
                role="alert"
                className="text-[13px] md:text-[14px] text-[#c43e16]"
              >
                Выберите оценку, чтобы отправить отзыв.
              </p>
            ) : reviewRating > 0 ? (
              <p className="text-[13px] md:text-[14px] text-[#c94f14]">
                Вы выбрали: {reviewRating} из 5 — {RATING_LABELS[reviewRating - 1]}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-[10px] border-t border-[rgba(19,19,20,0.08)] pt-[18px] sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setRatingError(false);
                setSubmitError(null);
              }}
              className="min-h-[48px] rounded-[10px] border border-[rgba(19,19,20,0.14)] px-[22px] text-[14px] font-medium text-[#131314] transition-colors hover:bg-[#f5f5f7] active:scale-[0.98] md:text-[16px]"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-h-[48px] rounded-[10px] bg-[#131314] px-[24px] text-[14px] font-medium text-white transition-colors hover:bg-[#2c2c2e] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 md:text-[16px]"
            >
              {isSubmitting ? "Отправка..." : "Отправить отзыв"}
            </button>
          </div>
        </div>
      )}

      {/* Sort Dropdown - shown on the right, only when form is not shown */}
      {!showForm && (
        <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-[12px] md:gap-[16px] lg:gap-[20px]">
          {/* Write Review Button */}
          <button
            onClick={handleWriteReviewClick}
            className="w-full md:w-auto bg-[#ef6f2e] text-white px-[24px] py-[14px] md:px-[28px] md:py-[16px] lg:px-[34px] lg:py-[20px] rounded-[60px] font-normal text-[14px] md:text-[16px] lg:text-[18px] leading-[1.1] hover:bg-[#d85f24] transition-colors"
          >
            Написать отзыв
          </button>

          {/* Sort Dropdown */}
          <div className="md:ml-auto border border-[rgba(19,19,20,0.08)] rounded-[10px] md:rounded-[12px] lg:rounded-[14px] px-[16px] py-[12px] md:px-[20px] md:py-[13px] lg:px-[24px] lg:py-[14px] flex items-center justify-between md:justify-start gap-[10px] cursor-pointer hover:bg-[#f5f5f7] transition-colors">
            <span className="font-normal text-[14px] md:text-[16px] lg:text-[18px] leading-[1.1] text-[#131314]">
              Сначала положительные
            </span>
            <svg
              className="w-[16px] h-[16px] md:w-[18px] md:h-[18px] lg:w-[20px] lg:h-[20px]"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M5 8l5 5 5-5"
                stroke="#131314"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="flex flex-col gap-[20px] md:gap-[24px] lg:gap-[30px]">
        {reviews.length > 0 ? (
          reviews.map((review) => {
            const reviewDate = new Date(review.createdAt);
            const formattedDate = reviewDate.toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const authorName =
              review.user?.name?.trim() || review.guestName?.trim() || "Гость";
            const userInitial = authorName.charAt(0).toUpperCase();

            return (
              <div
                key={review.id}
                className="pb-[20px] md:pb-[24px] lg:pb-[30px] border-b border-[rgba(19,19,20,0.08)] last:border-b-0"
              >
                <div className="flex items-start gap-[10px] md:gap-[12px] lg:gap-[14px] mb-[16px] md:mb-[20px] lg:mb-[24px]">
                  {/* Avatar */}
                  <div className="w-[36px] h-[36px] md:w-[40px] md:h-[40px] lg:w-[46px] lg:h-[46px] bg-[#ef6f2e] rounded-full flex items-center justify-center text-white font-medium text-[16px] md:text-[18px] lg:text-[22px] flex-shrink-0">
                    {userInitial}
                  </div>
                  <div className="flex flex-col gap-[4px] md:gap-[5px] lg:gap-[6px]">
                    <span className="font-medium text-[14px] md:text-[16px] lg:text-[18px] leading-[1.1] text-[#131314]">
                      {authorName}
                    </span>
                    <div className="flex flex-col md:flex-row md:items-center gap-[6px] md:gap-[10px] lg:gap-[14px]">
                      <div className="flex items-center gap-[4px] md:gap-[5px] lg:gap-[6px]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className="w-[14px] h-[14px] md:w-[16px] md:h-[16px] lg:w-[20px] lg:h-[20px]"
                            viewBox="0 0 20 20"
                            fill={star <= review.rating ? "#ef6f2e" : "none"}
                            stroke={
                              star <= review.rating
                                ? "#ef6f2e"
                                : "rgba(19,19,20,0.16)"
                            }
                          >
                            <path d="M10 1l2.245 6.91h7.255l-5.873 4.27 2.245 6.91L10 14.82l-5.872 4.27 2.245-6.91L.5 7.91h7.255L10 1z" />
                          </svg>
                        ))}
                      </div>
                      <span className="font-normal text-[12px] md:text-[14px] lg:text-[18px] leading-[1.1] text-[rgba(19,19,20,0.4)]">
                        {formattedDate}
                      </span>
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="font-normal text-[14px] md:text-[16px] lg:text-[18px] leading-[1.3] text-[#131314]">
                    {review.comment}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-[40px]">
            <p className="font-normal text-[16px] md:text-[18px] text-[rgba(19,19,20,0.4)]">
              Пока нет отзывов. Будьте первым!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
