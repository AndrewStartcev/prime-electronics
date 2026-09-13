"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ImageUpload,
  Input,
  RichTextEditor,
  SeoFields,
  Textarea,
} from "@/shared/ui";
import { useBlog, useUpdateBlog, type BlogProductBlock } from "@/shared/hooks";
import {
  isoToMoscowInput,
  moscowInputToIso,
} from "@/shared/lib/blogDateTime";
import { BlogPublishingFields } from "../_components/BlogPublishingFields";

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: blog, isLoading } = useBlog(id);
  const updateBlog = useUpdateBlog();

  const [formData, setFormData] = useState({
    title: "", text: "", slug: "", excerpt: "", imageUrl: "", authorId: "",
    readTime: "5 мин", tags: "", isActive: true, publishedAt: "",
    seoTitle: "", seoDescription: "", seoH1: "",
  });
  const [productBlocks, setProductBlocks] = useState<BlogProductBlock[]>([]);

  useEffect(() => {
    if (!blog) return;
    const meta = blog.meta && typeof blog.meta === "object" && !Array.isArray(blog.meta)
      ? (blog.meta as Record<string, unknown>) : {};
    setFormData({
      title: blog.title || "",
      text: blog.text || "",
      slug: blog.slug || "",
      excerpt: blog.excerpt || "",
      imageUrl: blog.imageUrl || "",
      authorId: blog.authorId || "",
      readTime: blog.readTime || "5 мин",
      tags: blog.tags?.join(", ") || "",
      isActive: blog.isActive ?? true,
      publishedAt: isoToMoscowInput(blog.publishedAt || blog.createdAt),
      seoTitle: String(meta.seoTitle || meta.title || ""),
      seoDescription: String(meta.seoDescription || meta.description || ""),
      seoH1: String(meta.seoH1 || meta.h1 || ""),
    });
    setProductBlocks(blog.productBlocks || []);
  }, [blog]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const tags = formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    const currentMeta = blog?.meta && typeof blog.meta === "object" && !Array.isArray(blog.meta)
      ? (blog.meta as Record<string, unknown>) : {};

    updateBlog.mutate({
      id,
      data: {
        title: formData.title,
        text: formData.text,
        slug: formData.slug,
        excerpt: formData.excerpt || undefined,
        imageUrl: formData.imageUrl || undefined,
        authorId: formData.authorId || undefined,
        readTime: formData.readTime || undefined,
        tags,
        meta: { ...currentMeta, seoTitle: formData.seoTitle.trim(), seoDescription: formData.seoDescription.trim(), seoH1: formData.seoH1.trim() },
        isActive: formData.isActive,
        publishedAt: moscowInputToIso(formData.publishedAt),
        productBlocks: productBlocks.map((block, blockIndex) => ({
          title: block.title || undefined,
          placement: "AFTER_ARTICLE",
          sortOrder: blockIndex,
          items: block.items.map((item, itemIndex) => ({ productId: item.productId, sortOrder: itemIndex })),
        })),
      },
    }, { onSuccess: () => router.push("/blog") });
  };

  const generateSlug = () => {
    const map: Record<string, string> = {а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"kh",ц:"ts",ч:"ch",ш:"sh",щ:"shch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya"};
    const slug = formData.title.toLowerCase().split("").map((ch) => map[ch] ?? ch).join("")
      .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    setFormData((value) => ({ ...value, slug }));
  };

  if (isLoading || !blog) return <div className="p-6">Загрузка статьи...</div>;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>←</Button>
        <div><h1 className="text-xl lg:text-2xl font-semibold">Редактировать статью</h1><p className="text-text-secondary-black mt-1">Изменение статьи блога</p></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        <Card><CardHeader><CardTitle>Основная информация</CardTitle></CardHeader><CardContent className="space-y-4">
          <div><label className="block text-sm font-medium mb-2">Название статьи *</label><Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-2">Slug (URL) *</label><div className="flex gap-2"><Input required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} /><Button type="button" variant="outline" onClick={generateSlug}>Сгенерировать</Button></div></div>
          <div><label className="block text-sm font-medium mb-2">Краткое описание</label><Textarea rows={3} value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-2">Содержание *</label><RichTextEditor content={formData.text} onChange={(text) => setFormData({ ...formData, text })} /></div>
        </CardContent></Card>

        <Card><CardHeader><CardTitle>SEO</CardTitle></CardHeader><CardContent><SeoFields value={{ seoTitle: formData.seoTitle, seoDescription: formData.seoDescription, seoH1: formData.seoH1 }} onChange={(seo) => setFormData({ ...formData, ...seo })} /></CardContent></Card>

        <Card><CardHeader><CardTitle>Медиа и метаданные</CardTitle></CardHeader><CardContent className="space-y-4">
          <ImageUpload value={formData.imageUrl} onChange={(imageUrl) => setFormData({ ...formData, imageUrl })} label="Изображение статьи" />
          <div><label className="block text-sm font-medium mb-2">Время чтения</label><Input value={formData.readTime} onChange={(e) => setFormData({ ...formData, readTime: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-2">Теги</label><Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} /></div>
          <BlogPublishingFields authorId={formData.authorId} publishedAt={formData.publishedAt} productBlocks={productBlocks} onAuthorChange={(authorId) => setFormData({ ...formData, authorId })} onPublishedAtChange={(publishedAt) => setFormData({ ...formData, publishedAt })} onProductBlocksChange={setProductBlocks} />
        </CardContent></Card>

        <Card><CardHeader><CardTitle>Публикация</CardTitle></CardHeader><CardContent>
          <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} /> Разрешить публикацию статьи</label>
          <p className="text-xs text-text-secondary-black mt-2">Активная статья с будущей датой считается запланированной и появится автоматически в указанное московское время.</p>
        </CardContent></Card>

        <div className="flex gap-3 justify-end"><Button type="button" variant="outline" onClick={() => router.back()}>Отмена</Button><Button type="submit" variant="primary" disabled={updateBlog.isPending}>{updateBlog.isPending ? "Сохранение..." : "Сохранить изменения"}</Button></div>
      </form>
    </div>
  );
}
