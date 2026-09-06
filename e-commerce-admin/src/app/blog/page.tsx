"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  TableSkeleton,
  ErrorMessage,
} from "@/shared/ui";
import { useBlogs, useDeleteBlog } from "@/shared/hooks";
import Image from "next/image";

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useBlogs({ page, limit: 10 });
  const deleteBlog = useDeleteBlog();

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить эту статью?")) {
      deleteBlog.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Все статьи</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={10} columns={6} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Блог
          </h1>
        </div>
        <ErrorMessage
          title="Не удалось загрузить статьи"
          message="Произошла ошибка при загрузке списка статей. Пожалуйста, попробуйте обновить страницу."
        />
      </div>
    );
  }

  const blogs = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Блог
          </h1>
          <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
            Управление статьями блога
            {meta && ` (${meta.total} статей)`}
          </p>
        </div>
        <Link href="/blog/new" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full sm:w-auto justify-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Добавить статью
          </Button>
        </Link>
      </div>

      {/* Blog Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Все статьи</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-text-secondary-black text-sm">
                    Изображение
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary-black text-sm">
                    Название
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary-black text-sm">
                    Slug
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary-black text-sm">
                    Автор
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary-black text-sm">
                    Теги
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary-black text-sm">
                    Статус
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary-black text-sm">
                    Дата создания
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-text-secondary-black text-sm">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog: any) => (
                  <tr
                    key={blog.id}
                    className="border-b border-gray-100 hover:bg-secondary-gray/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="w-16 h-16 bg-secondary-gray rounded-lg overflow-hidden flex items-center justify-center">
                        {blog.imageUrl ? (
                          <Image
                            src={blog.imageUrl}
                            alt={blog.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            className="w-6 h-6 text-text-secondary-black"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="max-w-xs">
                        <p className="font-medium text-primary-black line-clamp-2">
                          {blog.title}
                        </p>
                        {blog.excerpt && (
                          <p className="text-sm text-text-secondary-black line-clamp-1 mt-1">
                            {blog.excerpt}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-sm bg-secondary-gray px-2 py-1 rounded">
                        {blog.slug}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-primary-black">
                        {blog.author || "Редакция Prime"}
                      </p>
                      {blog.readTime && (
                        <p className="text-xs text-text-secondary-black">
                          {blog.readTime}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {blog.tags && blog.tags.length > 0 ? (
                          blog.tags
                            .slice(0, 2)
                            .map((tag: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-primary-orange/10 text-primary-orange rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))
                        ) : (
                          <span className="text-sm text-text-secondary-black">
                            —
                          </span>
                        )}
                        {blog.tags && blog.tags.length > 2 && (
                          <span className="text-xs text-text-secondary-black">
                            +{blog.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          blog.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {blog.isActive ? "Опубликовано" : "Черновик"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-text-secondary-black">
                      {new Date(blog.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/blog/${blog.id}`}>
                          <Button variant="outline" size="sm">
                            <svg
                              className="w-4 h-4"
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
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(blog.id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <svg
                            className="w-4 h-4"
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
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {blogs.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-text-secondary-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-primary-black">
                  Нет статей
                </h3>
                <p className="mt-1 text-sm text-text-secondary-black">
                  Начните с создания первой статьи для блога.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-gray">
              <p className="text-sm text-text-secondary-black">
                Страница {meta.page} из {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Назад
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= meta.totalPages}
                >
                  Далее
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
