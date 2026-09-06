"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  RichTextEditor,
  ImageUpload,
  SeoFields,
} from "@/shared/ui";
import { useCreateBlog } from "@/shared/hooks";

export default function NewBlogPage() {
  const router = useRouter();
  const createBlog = useCreateBlog();

  const [formData, setFormData] = useState({
    title: "",
    text: "",
    slug: "",
    excerpt: "",
    imageUrl: "",
    author: "Редакция Prime",
    readTime: "5 мин",
    tags: "",
    isActive: true,
    seoTitle: "",
    seoDescription: "",
    seoH1: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);

    createBlog.mutate(
      {
        title: formData.title,
        text: formData.text,
        slug: formData.slug,
        excerpt: formData.excerpt || undefined,
        imageUrl: formData.imageUrl || undefined,
        author: formData.author || undefined,
        readTime: formData.readTime || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        meta: {
          seoTitle: formData.seoTitle.trim(),
          seoDescription: formData.seoDescription.trim(),
          seoH1: formData.seoH1.trim(),
        },
        isActive: formData.isActive,
      },
      {
        onSuccess: () => {
          router.push("/blog");
        },
      },
    );
  };

  const generateSlug = () => {
    const translitMap: Record<string, string> = {
      а: "a",
      б: "b",
      в: "v",
      г: "g",
      д: "d",
      е: "e",
      ё: "yo",
      ж: "zh",
      з: "z",
      и: "i",
      й: "y",
      к: "k",
      л: "l",
      м: "m",
      н: "n",
      о: "o",
      п: "p",
      р: "r",
      с: "s",
      т: "t",
      у: "u",
      ф: "f",
      х: "kh",
      ц: "ts",
      ч: "ch",
      ш: "sh",
      щ: "shch",
      ъ: "",
      ы: "y",
      ь: "",
      э: "e",
      ю: "yu",
      я: "ya",
    };
    const slug = formData.title
      .toLowerCase()
      .split("")
      .map((ch) => translitMap[ch] ?? ch)
      .join("")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    setFormData({ ...formData, slug });
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </Button>
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">
            Новая статья
          </h1>
          <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
            Создание новой статьи для блога
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        {/* Main Info */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-black mb-2">
                Название статьи *
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Введите название статьи"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-black mb-2">
                Slug (URL) *
              </label>
              <div className="flex gap-2">
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="nazvanie-stati"
                  required
                />
                <Button type="button" variant="outline" onClick={generateSlug}>
                  Сгенерировать
                </Button>
              </div>
              <p className="text-xs text-text-secondary-black mt-1">
                Только строчные буквы, цифры и дефисы
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-black mb-2">
                Краткое описание
              </label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                placeholder="Краткое описание для превью статьи"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-black mb-2">
                Содержание *
              </label>
              <RichTextEditor
                content={formData.text}
                onChange={(html) => setFormData({ ...formData, text: html })}
                placeholder="Начните писать статью..."
              />
              <p className="text-xs text-text-secondary-black mt-1">
                Используйте панель инструментов для форматирования текста
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
          </CardHeader>
          <CardContent>
            <SeoFields
              value={{
                seoTitle: formData.seoTitle,
                seoDescription: formData.seoDescription,
                seoH1: formData.seoH1,
              }}
              onChange={(seoFields) =>
                setFormData({ ...formData, ...seoFields })
              }
            />
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle>Медиа и метаданные</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              label="Изображение статьи"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-black mb-2">
                  Автор
                </label>
                <Input
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  placeholder="Редакция Prime"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-black mb-2">
                  Время чтения
                </label>
                <Input
                  value={formData.readTime}
                  onChange={(e) =>
                    setFormData({ ...formData, readTime: e.target.value })
                  }
                  placeholder="5 мин"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-black mb-2">
                Теги
              </label>
              <Input
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="Apple, iPhone, Технологии"
              />
              <p className="text-xs text-text-secondary-black mt-1">
                Разделяйте теги запятыми
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Публикация</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-primary-orange border-border-gray rounded focus:ring-primary-orange"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-primary-black cursor-pointer"
              >
                Опубликовать статью
              </label>
            </div>
            <p className="text-xs text-text-secondary-black mt-2 ml-7">
              Снимите галочку, чтобы сохранить как черновик
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={createBlog.isPending}
          >
            {createBlog.isPending ? "Создание..." : "Создать статью"}
          </Button>
        </div>
      </form>
    </div>
  );
}
