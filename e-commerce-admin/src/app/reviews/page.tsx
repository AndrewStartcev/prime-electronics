"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  TableSkeleton,
  ErrorMessage,
  TablePagination,
  TableSearch,
} from "@/shared/ui";
import {
  useReviews,
  useReviewStats,
  useApproveReview,
  useRejectReview,
  useDeleteReview,
  useUpdateReview,
  type Review,
} from "@/shared/hooks";

type ReviewStatusFilter = "all" | "approved" | "pending";
type ReviewSortOption = "newest" | "oldest" | "rating_desc" | "rating_asc";

function getReviewerName(review: Review): string {
  return review.user?.name || review.guestName || "Гость";
}

function getSortParams(sortOption: ReviewSortOption): {
  sortBy: "createdAt" | "rating";
  sortOrder: "asc" | "desc";
} {
  switch (sortOption) {
    case "oldest":
      return { sortBy: "createdAt", sortOrder: "asc" };
    case "rating_desc":
      return { sortBy: "rating", sortOrder: "desc" };
    case "rating_asc":
      return { sortBy: "rating", sortOrder: "asc" };
    case "newest":
    default:
      return { sortBy: "createdAt", sortOrder: "desc" };
  }
}

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatusFilter>("all");
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(
    undefined,
  );
  const [sortOption, setSortOption] = useState<ReviewSortOption>("newest");
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editGuestName, setEditGuestName] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const sortParams = getSortParams(sortOption);
  const isActive =
    statusFilter === "all" ? undefined : statusFilter === "approved";

  const { data: stats, isLoading: statsLoading } = useReviewStats();
  const { data, isLoading, error } = useReviews({
    page,
    limit: 10,
    isActive,
    search: debouncedSearch || undefined,
    rating: ratingFilter,
    sortBy: sortParams.sortBy,
    sortOrder: sortParams.sortOrder,
  });

  const approveReview = useApproveReview();
  const rejectReview = useRejectReview();
  const deleteReview = useDeleteReview();
  const updateReview = useUpdateReview();

  const openEditModal = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating || 5);
    setEditComment(review.comment || "");
    setEditGuestName(review.guestName || "");
  };

  const closeEditModal = () => {
    setEditingReview(null);
    setEditRating(5);
    setEditComment("");
    setEditGuestName("");
  };

  const handleSaveReview = async () => {
    if (!editingReview) return;

    if (editRating < 1 || editRating > 5) {
      toast.error("Рейтинг должен быть от 1 до 5");
      return;
    }

    try {
      await updateReview.mutateAsync({
        id: editingReview.id,
        data: {
          rating: editRating,
          comment: editComment.trim(),
          guestName: editingReview.userId ? undefined : editGuestName.trim(),
        },
      });
      toast.success("Отзыв обновлён");
      closeEditModal();
    } catch (mutationError) {
      console.error("Failed to update review:", mutationError);
      toast.error("Не удалось обновить отзыв");
    }
  };

  const handleToggleStatus = async (review: Review) => {
    if (review.isActive) {
      if (!confirm("Перевести отзыв обратно на модерацию?")) return;
      rejectReview.mutate(review.id);
      return;
    }

    if (!confirm("Одобрить этот отзыв?")) return;
    approveReview.mutate(review.id);
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Удалить отзыв безвозвратно?")) return;

    try {
      await deleteReview.mutateAsync(reviewId);
      toast.success("Отзыв удалён");
    } catch (mutationError) {
      console.error("Failed to delete review:", mutationError);
      toast.error("Не удалось удалить отзыв");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setRatingFilter(undefined);
    setSortOption("newest");
    setPage(1);
  };

  const reviews = data?.data || [];
  const meta = data?.meta;
  const isMutating =
    approveReview.isPending ||
    rejectReview.isPending ||
    deleteReview.isPending ||
    updateReview.isPending;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Отзывы
          </h1>
          <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
            Отдельный список и модерация отзывов
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Всего отзывов</p>
            <p className="text-2xl font-semibold text-primary-black mt-1">
              {statsLoading ? "..." : stats?.total || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">На модерации</p>
            <p className="text-2xl font-semibold text-yellow-600 mt-1">
              {statsLoading ? "..." : stats?.pending || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Средний рейтинг</p>
            <p className="text-2xl font-semibold text-primary-black mt-1">
              {statsLoading ? "..." : stats?.avgRating?.toFixed(1) || "0.0"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-0">
            <p className="text-sm text-text-secondary-black">Одобренных</p>
            <p className="text-2xl font-semibold text-green-600 mt-1">
              {statsLoading ? "..." : stats?.approved || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card padding="sm">
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(260px,1.3fr)_1fr_1fr_1fr_auto] gap-3 items-center">
            <TableSearch
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Поиск по товару, автору или тексту..."
            />
            <select
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as ReviewStatusFilter);
                setPage(1);
              }}
            >
              <option value="all">Все статусы</option>
              <option value="pending">На модерации</option>
              <option value="approved">Одобренные</option>
            </select>
            <select
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
              value={ratingFilter ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                setRatingFilter(value ? Number(value) : undefined);
                setPage(1);
              }}
            >
              <option value="">Все рейтинги</option>
              <option value="5">5 ★</option>
              <option value="4">4 ★</option>
              <option value="3">3 ★</option>
              <option value="2">2 ★</option>
              <option value="1">1 ★</option>
            </select>
            <select
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
              value={sortOption}
              onChange={(event) => {
                setSortOption(event.target.value as ReviewSortOption);
                setPage(1);
              }}
            >
              <option value="newest">Сначала новые</option>
              <option value="oldest">Сначала старые</option>
              <option value="rating_desc">Рейтинг: высокий</option>
              <option value="rating_asc">Рейтинг: низкий</option>
            </select>
            <Button variant="outline" onClick={resetFilters}>
              Сбросить
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent>
            <TableSkeleton rows={8} columns={7} />
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent>
            <ErrorMessage
              title="Ошибка загрузки"
              message="Не удалось загрузить отзывы. Попробуйте обновить страницу."
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Список отзывов</CardTitle>
          </CardHeader>
          <CardContent>
            {!reviews.length ? (
              <div className="py-10 text-center text-text-secondary-black">
                Отзывы не найдены
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Товар
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Автор
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Рейтинг
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Отзыв
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Статус
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Дата
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-primary-black">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((review) => (
                      <tr
                        key={review.id}
                        className="border-b border-gray-50 hover:bg-secondary-gray/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm text-primary-black">
                          <div className="font-medium">
                            {review.product?.name || "Товар удалён"}
                          </div>
                          <div className="text-xs text-text-secondary-black mt-1">
                            ID: {review.productId}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-primary-black">
                          {getReviewerName(review)}
                        </td>
                        <td className="py-3 px-4 text-sm text-primary-black">
                          {review.rating} ★
                        </td>
                        <td className="py-3 px-4 text-sm text-primary-black max-w-md">
                          <div className="line-clamp-2">
                            {review.comment || "Без комментария"}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={review.isActive ? "success" : "warning"}>
                            {review.isActive ? "Одобрен" : "На модерации"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-secondary-black">
                          {new Date(review.createdAt).toLocaleString("ru-RU")}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(review)}
                              className="p-2 rounded-lg hover:bg-secondary-gray transition-colors"
                              title="Редактировать отзыв"
                              disabled={isMutating}
                            >
                              <svg
                                className="w-4 h-4 text-primary-black"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(review)}
                              className="p-2 rounded-lg hover:bg-secondary-gray transition-colors"
                              title={review.isActive ? "Вернуть на модерацию" : "Одобрить"}
                              disabled={isMutating}
                            >
                              {review.isActive ? (
                                <svg
                                  className="w-4 h-4 text-yellow-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-4 h-4 text-green-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </button>

                            <Link
                              href={`/products/${review.productId}`}
                              className="p-2 rounded-lg hover:bg-secondary-gray transition-colors"
                              title="Открыть товар"
                            >
                              <svg
                                className="w-4 h-4 text-primary-orange"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 7h4m0 0v4m0-4L10 14m-2 7h9a2 2 0 002-2v-9a2 2 0 00-2-2h-9a2 2 0 00-2 2v9a2 2 0 002 2z"
                                />
                              </svg>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDelete(review.id)}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Удалить отзыв"
                              disabled={isMutating}
                            >
                              <svg
                                className="w-4 h-4 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {meta && meta.totalPages > 1 && (
              <div className="mt-4">
                <TablePagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  onPageChange={setPage}
                  total={meta.total}
                  label="отзывов"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {editingReview && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={closeEditModal}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-primary-black">
                Редактирование отзыва
              </h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-2xl leading-none text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-secondary-black">
                  Товар
                </p>
                <p className="text-sm font-medium text-primary-black mt-1">
                  {editingReview.product?.name || "Товар удалён"}
                </p>
              </div>

              {!editingReview.userId && (
                <div>
                  <label className="block text-sm text-primary-black mb-1">
                    Имя гостя
                  </label>
                  <input
                    value={editGuestName}
                    onChange={(event) => setEditGuestName(event.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange"
                    placeholder="Имя автора"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-primary-black mb-1">
                  Рейтинг
                </label>
                <select
                  value={editRating}
                  onChange={(event) => setEditRating(Number(event.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange"
                >
                  <option value={5}>5 ★</option>
                  <option value={4}>4 ★</option>
                  <option value={3}>3 ★</option>
                  <option value={2}>2 ★</option>
                  <option value={1}>1 ★</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-primary-black mb-1">
                  Комментарий
                </label>
                <textarea
                  value={editComment}
                  onChange={(event) => setEditComment(event.target.value)}
                  rows={5}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary-orange/20 focus:border-primary-orange"
                  placeholder="Текст отзыва"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
              <Button variant="outline" onClick={closeEditModal} disabled={updateReview.isPending}>
                Отмена
              </Button>
              <Button variant="primary" onClick={handleSaveReview} isLoading={updateReview.isPending}>
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
