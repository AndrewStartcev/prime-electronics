"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, ErrorMessage, TableSkeleton } from "@/shared/ui";
import { useBlogs, useDeleteBlog } from "@/shared/hooks";

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useBlogs({ page, limit: 10 });
  const deleteBlog = useDeleteBlog();

  if (isLoading) return <Card><CardContent><TableSkeleton rows={10} columns={7} /></CardContent></Card>;
  if (error) return <ErrorMessage title="Не удалось загрузить статьи" message="Обновите страницу и попробуйте снова." />;

  const blogs = data?.data || [];
  const meta = data?.meta;
  const now = Date.now();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-semibold">Блог</h1><p className="text-text-secondary-black mt-1">Управление статьями{meta ? ` (${meta.total})` : ""}</p></div>
        <div className="flex gap-2">
          <Link href="/blog/authors"><Button variant="outline">Авторы</Button></Link>
          <Link href="/blog/new"><Button variant="primary">+ Добавить статью</Button></Link>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Все статьи</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b">
                {['Изображение','Название','Автор','Статус','Дата публикации','Товарные блоки','Действия'].map((label) => <th key={label} className="text-left py-3 px-4 text-sm font-medium text-text-secondary-black">{label}</th>)}
              </tr></thead>
              <tbody>
                {blogs.map((blog) => {
                  const scheduled = blog.isActive && new Date(blog.publishedAt).getTime() > now;
                  const status = !blog.isActive ? "Черновик" : scheduled ? "Запланирована" : "Опубликована";
                  return (
                    <tr key={blog.id} className="border-b hover:bg-secondary-gray/30">
                      <td className="py-3 px-4"><div className="w-14 h-14 bg-secondary-gray rounded-lg overflow-hidden">{blog.imageUrl && <Image src={blog.imageUrl} alt="" width={56} height={56} className="w-full h-full object-cover" />}</div></td>
                      <td className="py-3 px-4"><div className="max-w-sm"><div className="font-medium line-clamp-2">{blog.title}</div><code className="text-xs text-text-secondary-black">/{blog.slug}</code></div></td>
                      <td className="py-3 px-4 text-sm">{blog.authorProfile?.name || blog.author || "Редакция Prime"}</td>
                      <td className="py-3 px-4"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${!blog.isActive ? 'bg-gray-100 text-gray-700' : scheduled ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>{status}</span></td>
                      <td className="py-3 px-4 text-sm text-text-secondary-black">{new Date(blog.publishedAt).toLocaleString("ru-RU")}</td>
                      <td className="py-3 px-4 text-sm">{blog.productBlocks?.length ?? (blog as any)._count?.productBlocks ?? 0}</td>
                      <td className="py-3 px-4"><div className="flex gap-2"><Link href={`/blog/${blog.id}`}><Button variant="outline" size="sm">Изменить</Button></Link><Button variant="outline" size="sm" onClick={() => { if (confirm("Удалить статью?")) deleteBlog.mutate(blog.id); }}>Удалить</Button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && <div className="flex justify-between items-center mt-4"><Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Назад</Button><span className="text-sm text-text-secondary-black">{page} / {meta.totalPages}</span><Button variant="outline" disabled={page >= meta.totalPages} onClick={() => setPage((value) => value + 1)}>Далее</Button></div>}
        </CardContent>
      </Card>
    </div>
  );
}
