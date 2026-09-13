"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, ImageUpload, Input, Textarea } from "@/shared/ui";
import { useBlogAuthors, useCreateBlogAuthor, useDeleteBlogAuthor, useUpdateBlogAuthor, type BlogAuthor } from "@/shared/hooks";

const emptyForm = { name: "", avatarUrl: "", bio: "", isActive: true };

export default function BlogAuthorsPage() {
  const router = useRouter();
  const { data: authors = [], isLoading } = useBlogAuthors();
  const createAuthor = useCreateBlogAuthor();
  const updateAuthor = useUpdateBlogAuthor();
  const deleteAuthor = useDeleteBlogAuthor();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const startEdit = (author: BlogAuthor) => {
    setEditingId(author.id);
    setForm({ name: author.name, avatarUrl: author.avatarUrl || "", bio: author.bio || "", isActive: author.isActive });
  };

  const reset = () => { setEditingId(null); setForm(emptyForm); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (editingId) {
      updateAuthor.mutate({ id: editingId, data: form }, { onSuccess: reset });
    } else {
      createAuthor.mutate(form, { onSuccess: reset });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push("/blog")}>←</Button>
          <div><h1 className="text-2xl font-semibold">Авторы блога</h1><p className="text-sm text-text-secondary-black">PE-08 — профили авторов, аватары и описание</p></div>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>{editingId ? "Редактировать автора" : "Новый автор"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div><label className="block text-sm font-medium mb-2">Имя *</label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <ImageUpload value={form.avatarUrl} onChange={(avatarUrl) => setForm({ ...form, avatarUrl })} label="Аватар автора" />
            <div><label className="block text-sm font-medium mb-2">Короткая информация</label><Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Коротко об авторе" /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Активный автор</label>
            <div className="flex gap-2"><Button type="submit" variant="primary" disabled={createAuthor.isPending || updateAuthor.isPending}>{editingId ? "Сохранить" : "Добавить автора"}</Button>{editingId && <Button type="button" variant="outline" onClick={reset}>Отмена</Button>}</div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Авторы</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p>Загрузка...</p> : (
            <div className="divide-y">
              {authors.map((author) => (
                <div key={author.id} className="py-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary-gray overflow-hidden shrink-0 flex items-center justify-center">
                    {author.avatarUrl ? <img src={author.avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="font-semibold">{author.name.slice(0, 1)}</span>}
                  </div>
                  <div className="flex-1 min-w-0"><div className="font-medium">{author.name}</div><div className="text-sm text-text-secondary-black truncate">{author.bio || "Без описания"}</div><div className="text-xs text-text-secondary-black mt-1">Статей: {author._count?.posts ?? 0} · {author.isActive ? "Активен" : "Выключен"}</div></div>
                  <Button type="button" variant="outline" size="sm" onClick={() => startEdit(author)}>Изменить</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => { if (confirm(`Удалить автора «${author.name}»? Статьи сохранят старое имя автора.`)) deleteAuthor.mutate(author.id); }}>Удалить</Button>
                </div>
              ))}
              {authors.length === 0 && <p className="py-4 text-text-secondary-black">Авторов пока нет.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
