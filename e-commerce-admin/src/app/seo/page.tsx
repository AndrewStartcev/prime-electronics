"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  SeoFields,
  Textarea,
} from "@/shared/ui";
import type { SeoFieldsValue } from "@/shared/ui";
import type {
  SeoPageType,
  SeoTemplate,
  StaticPageSeo,
} from "@/shared/api";
import {
  useSeoTemplates,
  useStaticPageSeoList,
  useUpdateSeoTemplate,
  useUpdateStaticPageSeo,
} from "@/shared/hooks";
import { SeoManagement } from "@/widgets/SeoManagement/SeoManagement";

const SHOW_LEGACY_STATIC_PAGE_SEO = false;

const templateLabels: Record<SeoPageType, string> = {
  HOME: "Главная",
  CATEGORY: "Категории каталога",
  PRODUCT: "Товары",
  STATIC: "Статические страницы",
  BLOG: "Блог",
};

const variableHints = [
  "[Название]",
  "[Название страницы]",
  "[Название категории]",
  "[Название товара]",
  "[Количество товаров]",
  "[Минимальная стоимость товара]",
  "[Минимальная цена]",
  "[Стоимость товара]",
  "[Цена]",
];

function trimPayload<T extends Record<string, unknown>>(payload: T): T {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : value,
    ]),
  ) as T;
}

function TemplateForm({ template }: { template: SeoTemplate }) {
  const updateTemplate = useUpdateSeoTemplate();
  const [formData, setFormData] = useState({
    titleTemplate: template.titleTemplate || "",
    descriptionTemplate: template.descriptionTemplate || "",
    h1Template: template.h1Template || "",
  });

  useEffect(() => {
    setFormData({
      titleTemplate: template.titleTemplate || "",
      descriptionTemplate: template.descriptionTemplate || "",
      h1Template: template.h1Template || "",
    });
  }, [template]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await updateTemplate.mutateAsync({
        type: template.type,
        data: trimPayload(formData),
      });
      toast.success(`Шаблон «${templateLabels[template.type]}» сохранен`);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Не удалось сохранить шаблон",
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{templateLabels[template.type]}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Шаблон Title"
            placeholder="[Название] купить в Prime Electronics"
            value={formData.titleTemplate}
            onChange={(event) =>
              setFormData({
                ...formData,
                titleTemplate: event.target.value,
              })
            }
          />
          <Textarea
            label="Шаблон Description"
            rows={3}
            placeholder="[Название] в наличии. Цена от [Минимальная цена] ₽."
            value={formData.descriptionTemplate}
            onChange={(event) =>
              setFormData({
                ...formData,
                descriptionTemplate: event.target.value,
              })
            }
          />
          <Input
            label="Шаблон H1"
            placeholder="[Название]"
            value={formData.h1Template}
            onChange={(event) =>
              setFormData({ ...formData, h1Template: event.target.value })
            }
          />
          <Button
            type="submit"
            variant="primary"
            disabled={updateTemplate.isPending}
          >
            {updateTemplate.isPending ? "Сохранение..." : "Сохранить шаблон"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function StaticPageForm({ page }: { page: StaticPageSeo }) {
  const updateStaticPage = useUpdateStaticPageSeo();
  const [identity, setIdentity] = useState({
    name: page.name || "",
    title: page.title || "",
    isActive: page.isActive,
  });
  const [seoFields, setSeoFields] = useState<SeoFieldsValue>({
    seoTitle: page.seoTitle || "",
    seoDescription: page.seoDescription || "",
    seoH1: page.seoH1 || "",
  });

  useEffect(() => {
    setIdentity({
      name: page.name || "",
      title: page.title || "",
      isActive: page.isActive,
    });
    setSeoFields({
      seoTitle: page.seoTitle || "",
      seoDescription: page.seoDescription || "",
      seoH1: page.seoH1 || "",
    });
  }, [page]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await updateStaticPage.mutateAsync(
        trimPayload({
          path: page.path,
          name: identity.name,
          title: identity.title,
          isActive: identity.isActive,
          ...seoFields,
        }),
      );
      toast.success(`SEO для ${page.path} сохранено`);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Не удалось сохранить страницу",
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{identity.name || page.path}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Путь" value={page.path} disabled />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Название в админке"
              value={identity.name}
              onChange={(event) =>
                setIdentity({ ...identity, name: event.target.value })
              }
            />
            <Input
              label="Название страницы"
              value={identity.title}
              onChange={(event) =>
                setIdentity({ ...identity, title: event.target.value })
              }
            />
          </div>
          <SeoFields value={seoFields} onChange={setSeoFields} />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={identity.isActive}
              onChange={(event) =>
                setIdentity({ ...identity, isActive: event.target.checked })
              }
              className="w-4 h-4 rounded border-gray-300 text-primary-orange focus:ring-primary-orange"
            />
            <span className="text-sm text-primary-black">SEO активно</span>
          </label>
          <Button
            type="submit"
            variant="primary"
            disabled={updateStaticPage.isPending}
          >
            {updateStaticPage.isPending ? "Сохранение..." : "Сохранить страницу"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SeoPage() {
  const { data: templates = [], isLoading: templatesLoading } = useSeoTemplates();
  const { data: staticPages = [], isLoading: staticPagesLoading } = useStaticPageSeoList();

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-primary-black">SEO</h1>
          <p className="text-text-secondary-black mt-1 text-sm lg:text-base">
            Шаблоны мета-тегов, H1 и ручные настройки для служебных страниц
          </p>
        </div>
        <Link href="/pages">
          <Button type="button" variant="primary">Конструктор страниц</Button>
        </Link>
      </div>

      <Card>
        <CardHeader><CardTitle>Конструктор статических страниц</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-text-secondary-black">
            Контент страниц собирается из готовых блоков. SEO-поля остаются общими с этим разделом.
          </p>
          <Link href="/pages"><Button type="button" variant="outline">Открыть конструктор</Button></Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Переменные шаблонов</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {variableHints.map((variable) => (
              <code key={variable} className="rounded-lg bg-secondary-gray px-3 py-2 text-sm text-primary-black">
                {variable}
              </code>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-primary-black">Шаблоны</h2>
        {templatesLoading ? (
          <Card><CardContent><p className="text-sm text-text-secondary-black">Загрузка шаблонов...</p></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
            {templates.map((template) => <TemplateForm key={template.type} template={template} />)}
          </div>
        )}
      </section>

      {SHOW_LEGACY_STATIC_PAGE_SEO && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-primary-black">Статические страницы</h2>
          {staticPagesLoading ? (
            <Card><CardContent><p className="text-sm text-text-secondary-black">Загрузка страниц...</p></CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              {staticPages.map((page) => <StaticPageForm key={page.path} page={page} />)}
            </div>
          )}
        </section>
      )}

      <SeoManagement />
    </div>
  );
}
