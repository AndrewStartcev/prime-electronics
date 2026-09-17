"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ImageUpload,
  Input,
  RichTextEditor,
  Textarea,
} from "@/shared/ui";
import {
  pageBuilderApi,
  type StaticBuilderPage,
  type StaticPageBlock,
  type StaticPageBlockType,
} from "@/shared/api";

const BLOCK_TYPES: Array<{ value: StaticPageBlockType; label: string; hint: string }> = [
  { value: "hero", label: "Hero / шапка", hint: "H1 и подзаголовок страницы" },
  { value: "richText", label: "Текст", hint: "Заголовок и HTML-текст" },
  { value: "imageText", label: "Текст + изображение", hint: "Двухколоночная секция" },
  { value: "cards", label: "Карточки", hint: "Преимущества, контакты, условия" },
  { value: "stats", label: "Цифры / статистика", hint: "Крупные показатели" },
  { value: "steps", label: "Шаги", hint: "Последовательность действий" },
  { value: "table", label: "Таблица", hint: "Тарифы, сроки, условия" },
  { value: "info", label: "Инфоблок", hint: "Предупреждение или заметка" },
  { value: "cta", label: "CTA", hint: "Призыв к действию с кнопкой" },
  { value: "map", label: "Карта", hint: "Карта по поисковому запросу" },
  { value: "contactForm", label: "Форма обратной связи", hint: "Стандартная форма PRIME" },
  { value: "promotionGrid", label: "Актуальные акции", hint: "Динамическая плитка акций" },
  { value: "productGrid", label: "Товары", hint: "Динамическая плитка товаров" },
];

const DEFAULT_DATA: Record<StaticPageBlockType, Record<string, any>> = {
  hero: { title: "Новый заголовок", subtitle: "" },
  richText: { title: "Текстовый блок", html: "<p>Текст блока</p>" },
  imageText: { title: "Текст и изображение", html: "<p>Текст блока</p>", image: "", imageAlt: "", imageSide: "right" },
  cards: { title: "Карточки", columns: 3, items: [{ title: "Карточка", text: "Описание" }] },
  stats: { title: "В цифрах", items: [{ value: "100+", label: "показатель" }] },
  steps: { title: "Как это работает", items: [{ title: "Шаг 1", text: "Описание шага" }] },
  table: { title: "Таблица", columns: ["Колонка 1", "Колонка 2"], rows: [["Значение", "Значение"]] },
  info: { title: "Важно", html: "<p>Информация</p>", tone: "orange" },
  cta: { title: "Остались вопросы?", text: "", buttonText: "Подробнее", buttonHref: "/contacts" },
  map: { title: "Мы на карте", query: "PRIME Electronics Москва" },
  contactForm: { title: "Напишите нам", subtitle: "Оставьте сообщение — мы свяжемся с вами." },
  promotionGrid: { title: "Актуальные предложения", limit: 6 },
  productGrid: { title: "Товары", limit: 8 },
};

const emptyPage = (): StaticBuilderPage => ({
  path: "/new-page",
  name: "Новая страница",
  title: "Новая страница",
  seoTitle: "",
  seoDescription: "",
  seoH1: "",
  isActive: true,
  blocks: [],
});

function clonePage(page: StaticBuilderPage): StaticBuilderPage {
  return JSON.parse(JSON.stringify(page));
}

function normalizePath(value: string) {
  const cleaned = value.trim().replace(/^https?:\/\/[^/]+/i, "");
  const path = `/${cleaned.replace(/^\/+|\/+$/g, "")}`;
  return path === "/" ? "/" : path;
}

function BlockPreview({ block }: { block: StaticPageBlock }) {
  const data = block.data || {};
  const type = BLOCK_TYPES.find((item) => item.value === block.type);
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-secondary-gray/40 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-primary-orange">{type?.label || block.type}</div>
      <div className="mt-1 text-base font-medium text-primary-black">{data.title || data.value || type?.hint}</div>
      {(data.subtitle || data.text) && <div className="mt-1 line-clamp-2 text-sm text-text-secondary-black">{data.subtitle || data.text}</div>}
      {Array.isArray(data.items) && <div className="mt-2 text-xs text-text-secondary-black">Элементов: {data.items.length}</div>}
    </div>
  );
}

function StringField({ label, value, onChange, multiline = false }: { label: string; value: any; onChange: (value: string) => void; multiline?: boolean }) {
  if (multiline) {
    return <Textarea label={label} rows={4} value={String(value || "")} onChange={(event) => onChange(event.target.value)} />;
  }
  return <Input label={label} value={String(value || "")} onChange={(event) => onChange(event.target.value)} />;
}

function HtmlField({ label, value, onChange }: { label: string; value: any; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-primary-black">{label}</div>
      <RichTextEditor content={String(value || "")} onChange={onChange} />
    </div>
  );
}

function ItemsEditor({ items, onChange, mode, variant }: { items: any[]; onChange: (items: any[]) => void; mode: "cards" | "stats" | "steps"; variant?: string }) {
  const add = () => {
    if (mode === "stats") return onChange([...items, { value: "100+", label: "Показатель" }]);
    if (mode === "steps") return onChange([...items, { number: String(items.length + 1).padStart(2, "0"), title: `Шаг ${items.length + 1}`, text: "Описание шага" }]);
    if (variant === "promotionFeature") return onChange([...items, { icon: "/icons/check.svg", text: "Новый пункт" }]);
    onChange([...items, { title: "Карточка", text: "Описание" }]);
  };

  const setItem = (index: number, key: string, value: any) => {
    const next = [...items];
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><span className="text-sm font-medium">Элементы</span><Button type="button" size="sm" variant="outline" onClick={add}><Plus className="mr-1 h-4 w-4" />Добавить</Button></div>
      {items.map((item, index) => (
        <div key={index} className="space-y-2 rounded-xl border border-gray-200 p-3">
          {mode === "stats" ? (
            <div className="grid gap-2 md:grid-cols-2">
              <Input placeholder="Значение" value={item.value || ""} onChange={(e) => setItem(index, "value", e.target.value)} />
              <Input placeholder="Подпись" value={item.label || ""} onChange={(e) => setItem(index, "label", e.target.value)} />
            </div>
          ) : variant === "promotionFeature" ? (
            <div className="space-y-2">
              <Input placeholder="Текст" value={item.text || ""} onChange={(e) => setItem(index, "text", e.target.value)} />
              <ImageUpload label="Иконка" value={item.icon || ""} onChange={(value) => setItem(index, "icon", value)} />
            </div>
          ) : (
            <>
              <div className="grid gap-2 md:grid-cols-2">
                {mode === "steps" && <Input placeholder="Номер" value={item.number || ""} onChange={(e) => setItem(index, "number", e.target.value)} />}
                <Input placeholder="Заголовок" value={item.title || ""} onChange={(e) => setItem(index, "title", e.target.value)} />
                <Input placeholder="Описание" value={item.text || ""} onChange={(e) => setItem(index, "text", e.target.value)} />
              </div>
              {variant === "iconFeatures" && <ImageUpload label="Иконка" value={item.icon || ""} onChange={(value) => setItem(index, "icon", value)} />}
              {variant === "warrantyIcons" && <Input placeholder="Иконка / идентификатор" value={item.icon || ""} onChange={(e) => setItem(index, "icon", e.target.value)} />}
              {variant === "deliveryOptions" && <><ImageUpload label="Иконка" value={item.icon || ""} onChange={(value) => setItem(index, "icon", value)} /><div className="grid gap-2 md:grid-cols-2"><Input placeholder="Стоимость" value={item.price || ""} onChange={(e) => setItem(index, "price", e.target.value)} /><Input placeholder="Срок" value={item.time || ""} onChange={(e) => setItem(index, "time", e.target.value)} /></div></>}
              {variant === "contactMethods" && <div className="grid gap-2 md:grid-cols-2"><Input placeholder="Иконка" value={item.icon || ""} onChange={(e) => setItem(index, "icon", e.target.value)} /><Input placeholder="Ссылка" value={item.href || ""} onChange={(e) => setItem(index, "href", e.target.value)} /></div>}
              {variant === "storeInfo" && <div className="grid gap-2 md:grid-cols-2"><Input placeholder="Тип точки" value={item.kind || ""} onChange={(e) => setItem(index, "kind", e.target.value)} /><Input placeholder="Адрес" value={item.address || ""} onChange={(e) => setItem(index, "address", e.target.value)} /><Input placeholder="Метро" value={item.metro || ""} onChange={(e) => setItem(index, "metro", e.target.value)} /><Input placeholder="Телефон" value={item.phone || ""} onChange={(e) => setItem(index, "phone", e.target.value)} /><Input placeholder="Ссылка телефона" value={item.phoneHref || ""} onChange={(e) => setItem(index, "phoneHref", e.target.value)} /><Input placeholder="Режим работы" value={item.workHours || ""} onChange={(e) => setItem(index, "workHours", e.target.value)} /></div>}
              {variant === "brandLogos" && <ImageUpload label="Логотип" value={item.image || ""} onChange={(value) => setItem(index, "image", value)} />}
              {variant === "paymentMethods" && <Input placeholder="Иконка" value={item.icon || ""} onChange={(e) => setItem(index, "icon", e.target.value)} />}
            </>
          )}
          <div className="flex justify-end"><button type="button" className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 hover:bg-red-50 hover:text-red-600" onClick={() => onChange(items.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></button></div>
        </div>
      ))}
    </div>
  );
}

function TableEditor({ columns: rawColumns, rows: rawRows, onChange }: { columns: string[]; rows: string[][]; onChange: (columns: string[], rows: string[][]) => void }) {
  const columns = rawColumns?.length ? rawColumns : ["Колонка 1"];
  const rows = Array.isArray(rawRows) ? rawRows : [];
  const normalizedRows = rows.map((row) => columns.map((_, index) => row?.[index] || ""));

  const updateColumn = (index: number, value: string) => { const next = [...columns]; next[index] = value; onChange(next, normalizedRows); };
  const addColumn = () => onChange([...columns, `Колонка ${columns.length + 1}`], normalizedRows.map((row) => [...row, ""]));
  const removeColumn = (index: number) => { if (columns.length <= 1) return; onChange(columns.filter((_, columnIndex) => columnIndex !== index), normalizedRows.map((row) => row.filter((_, columnIndex) => columnIndex !== index))); };
  const updateCell = (rowIndex: number, columnIndex: number, value: string) => { const nextRows = normalizedRows.map((row) => [...row]); nextRows[rowIndex][columnIndex] = value; onChange(columns, nextRows); };
  const addRow = () => onChange(columns, [...normalizedRows, columns.map(() => "")]);
  const removeRow = (rowIndex: number) => onChange(columns, normalizedRows.filter((_, index) => index !== rowIndex));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-medium">Таблица</span><div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={addColumn}><Plus className="mr-1 h-4 w-4" />Колонка</Button><Button type="button" size="sm" variant="outline" onClick={addRow}><Plus className="mr-1 h-4 w-4" />Строка</Button></div></div>
      <div className="overflow-x-auto rounded-xl border border-gray-200"><div className="min-w-max p-3"><div className="mb-2 grid gap-2" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(180px, 1fr)) 40px` }}>{columns.map((column, columnIndex) => <div key={`column-${columnIndex}`} className="flex gap-1"><Input aria-label={`Колонка ${columnIndex + 1}`} value={column} onChange={(event) => updateColumn(columnIndex, event.target.value)} />{columns.length > 1 && <button type="button" aria-label={`Удалить колонку ${columnIndex + 1}`} className="flex h-10 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 hover:bg-red-50 hover:text-red-600" onClick={() => removeColumn(columnIndex)}><Trash2 className="h-4 w-4" /></button>}</div>)}<div /></div><div className="space-y-2">{normalizedRows.map((row, rowIndex) => <div key={`row-${rowIndex}`} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(180px, 1fr)) 40px` }}>{columns.map((_, columnIndex) => <Input key={`cell-${rowIndex}-${columnIndex}`} aria-label={`Строка ${rowIndex + 1}, колонка ${columnIndex + 1}`} value={row[columnIndex] || ""} onChange={(event) => updateCell(rowIndex, columnIndex, event.target.value)} />)}<button type="button" aria-label={`Удалить строку ${rowIndex + 1}`} className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 hover:bg-red-50 hover:text-red-600" onClick={() => removeRow(rowIndex)}><Trash2 className="h-4 w-4" /></button></div>)}</div>{normalizedRows.length === 0 && <div className="py-4 text-center text-sm text-text-secondary-black">Добавьте первую строку таблицы</div>}</div></div>
    </div>
  );
}

function BlockEditor({ block, onChange }: { block: StaticPageBlock; onChange: (block: StaticPageBlock) => void }) {
  const data = block.data || {};
  const set = (key: string, value: any) => onChange({ ...block, data: { ...data, [key]: value } });
  const setTable = (columns: string[], rows: string[][]) => onChange({ ...block, data: { ...data, columns, rows } });

  return (
    <div className="space-y-4">
      <BlockPreview block={block} />
      {block.type === "hero" && <><StringField label="Заголовок" value={data.title} onChange={(v) => set("title", v)} /><StringField label="Подзаголовок" value={data.subtitle} onChange={(v) => set("subtitle", v)} multiline /></>}
      {block.type === "richText" && <><StringField label="Заголовок" value={data.title} onChange={(v) => set("title", v)} />{data.number !== undefined && <StringField label="Номер секции" value={data.number} onChange={(v) => set("number", v)} />}<HtmlField label="Текст" value={data.html} onChange={(v) => set("html", v)} /></>}
      {block.type === "imageText" && <><StringField label="Заголовок" value={data.title} onChange={(v) => set("title", v)} /><HtmlField label="Текст" value={data.html} onChange={(v) => set("html", v)} /><ImageUpload label="Изображение" value={data.image || ""} onChange={(v) => set("image", v)} />{data.mobileImage !== undefined && <ImageUpload label="Изображение на мобильных" value={data.mobileImage || ""} onChange={(v) => set("mobileImage", v)} />}<StringField label="Alt" value={data.imageAlt} onChange={(v) => set("imageAlt", v)} /><label className="block text-sm font-medium">Сторона изображения<select className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 font-normal" value={data.imageSide || "right"} onChange={(e) => set("imageSide", e.target.value)}><option value="right">Справа</option><option value="left">Слева</option></select></label>{data.anchor !== undefined && <StringField label="Якорь секции" value={data.anchor} onChange={(v) => set("anchor", v)} />}{Array.isArray(data.items) && <ItemsEditor mode="cards" variant="promotionFeature" items={data.items} onChange={(v) => set("items", v)} />}{data.buttonText !== undefined && <div className="grid gap-3 md:grid-cols-2"><StringField label="Текст кнопки" value={data.buttonText} onChange={(v) => set("buttonText", v)} /><StringField label="Ссылка кнопки" value={data.buttonHref} onChange={(v) => set("buttonHref", v)} /></div>}</>}
      {block.type === "cards" && <><StringField label="Заголовок секции" value={data.title} onChange={(v) => set("title", v)} />{data.subtitle !== undefined && <StringField label="Подзаголовок" value={data.subtitle} onChange={(v) => set("subtitle", v)} multiline />}<ItemsEditor mode="cards" variant={data.variant} items={data.items || []} onChange={(v) => set("items", v)} /></>}
      {block.type === "stats" && <><StringField label="Заголовок секции" value={data.title} onChange={(v) => set("title", v)} /><ItemsEditor mode="stats" items={data.items || []} onChange={(v) => set("items", v)} /></>}
      {block.type === "steps" && <><StringField label="Заголовок секции" value={data.title} onChange={(v) => set("title", v)} />{data.subtitle !== undefined && <StringField label="Подзаголовок" value={data.subtitle} onChange={(v) => set("subtitle", v)} multiline />}<ItemsEditor mode="steps" variant={data.variant} items={data.items || []} onChange={(v) => set("items", v)} /></>}
      {block.type === "table" && <><StringField label="Заголовок" value={data.title} onChange={(v) => set("title", v)} /><TableEditor columns={data.columns || []} rows={data.rows || []} onChange={setTable} /></>}
      {block.type === "info" && <><StringField label="Заголовок" value={data.title} onChange={(v) => set("title", v)} /><HtmlField label="Текст" value={data.html} onChange={(v) => set("html", v)} /></>}
      {block.type === "cta" && <><StringField label="Заголовок" value={data.title} onChange={(v) => set("title", v)} /><StringField label="Текст" value={data.text} onChange={(v) => set("text", v)} multiline /><div className="grid gap-3 md:grid-cols-2"><StringField label="Текст кнопки" value={data.buttonText} onChange={(v) => set("buttonText", v)} /><StringField label="Ссылка кнопки" value={data.buttonHref} onChange={(v) => set("buttonHref", v)} /><StringField label="Текст второй кнопки" value={data.button2Text} onChange={(v) => set("button2Text", v)} /><StringField label="Ссылка второй кнопки" value={data.button2Href} onChange={(v) => set("button2Href", v)} /></div>{data.anchorId !== undefined && <StringField label="Якорь блока" value={data.anchorId} onChange={(v) => set("anchorId", v)} />}</>}
      {block.type === "map" && <><StringField label="Заголовок" value={data.title} onChange={(v) => set("title", v)} /><StringField label="Поисковый запрос карты" value={data.query} onChange={(v) => set("query", v)} />{data.src !== undefined && <StringField label="URL iframe карты" value={data.src} onChange={(v) => set("src", v)} />}</>}
      {block.type === "contactForm" && <><StringField label="Заголовок" value={data.title} onChange={(v) => set("title", v)} /><StringField label="Подзаголовок" value={data.subtitle} onChange={(v) => set("subtitle", v)} /></>}
      {(block.type === "promotionGrid" || block.type === "productGrid") && <div className="grid gap-3 md:grid-cols-2"><StringField label="Заголовок" value={data.title} onChange={(v) => set("title", v)} /><Input label="Количество" type="number" min={1} max={24} value={data.limit || 6} onChange={(e) => set("limit", Number(e.target.value) || 6)} /></div>}
    </div>
  );
}

export default function PagesBuilderPage() {
  const [pages, setPages] = useState<StaticBuilderPage[]>([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [draft, setDraft] = useState<StaticBuilderPage>(emptyPage());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newBlockType, setNewBlockType] = useState<StaticPageBlockType>("hero");

  const selected = useMemo(() => pages.find((page) => page.path === selectedPath), [pages, selectedPath]);

  const load = async () => {
    const data = await pageBuilderApi.list();
    setPages(data);
    if (!selectedPath && data[0]) { setSelectedPath(data[0].path); setDraft(clonePage(data[0])); }
    setLoading(false);
  };

  useEffect(() => { load().catch(() => { toast.error("Не удалось загрузить страницы"); setLoading(false); }); }, []);
  useEffect(() => { if (selected) setDraft(clonePage(selected)); }, [selected?.path]);

  const choosePage = (path: string) => { const page = pages.find((item) => item.path === path); if (!page) return; setSelectedPath(path); setDraft(clonePage(page)); };
  const createNew = () => { setSelectedPath(""); setDraft(emptyPage()); };
  const addBlock = () => setDraft((previous) => ({ ...previous, blocks: [...previous.blocks, { type: newBlockType, version: 1, data: JSON.parse(JSON.stringify(DEFAULT_DATA[newBlockType])) }] }));

  const save = async () => {
    const path = normalizePath(draft.path);
    if (!path || !draft.name?.trim()) return toast.error("Укажите URL и название страницы");
    setSaving(true);
    try {
      await pageBuilderApi.save({ path, name: draft.name, title: draft.title, seoTitle: draft.seoTitle, seoDescription: draft.seoDescription, seoH1: draft.seoH1, isActive: draft.isActive, blocks: draft.blocks });
      toast.success("Страница сохранена");
      const data = await pageBuilderApi.list();
      setPages(data);
      setSelectedPath(path);
      const refreshed = data.find((item) => item.path === path);
      if (refreshed) setDraft(clonePage(refreshed));
    } catch (error: any) { toast.error(error?.response?.data?.message || "Не удалось сохранить страницу"); } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!selectedPath || !window.confirm(`Удалить страницу ${selectedPath}?`)) return;
    await pageBuilderApi.remove(selectedPath);
    toast.success("Страница удалена");
    setSelectedPath("");
    setDraft(emptyPage());
    await load();
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><h1 className="text-2xl font-semibold">Страницы</h1><Button type="button" onClick={createNew}><Plus className="mr-2 h-4 w-4" />Новая страница</Button></div>
      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <Card className="h-fit"><CardHeader><CardTitle>Страницы</CardTitle></CardHeader><CardContent className="space-y-2">{pages.map((page) => <button key={page.path} type="button" onClick={() => choosePage(page.path)} className={`w-full rounded-xl border px-3 py-3 text-left transition ${selectedPath === page.path ? "border-primary-orange bg-orange-50" : "border-gray-200 bg-white hover:border-gray-300"}`}><div className="font-medium">{page.name || page.title || page.path}</div><div className="mt-1 text-xs text-text-secondary-black">{page.path} · {page.blocks.length} блоков</div></button>)}</CardContent></Card>
        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Настройки страницы</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><Input label="Название в админке" value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value, title: draft.title || e.target.value })} /><Input label="URL" value={draft.path} onChange={(e) => setDraft({ ...draft, path: e.target.value })} /></div><Input label="Заголовок страницы" value={draft.title || ""} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} />Страница активна</label></CardContent></Card>
          <Card><CardHeader><CardTitle>SEO</CardTitle></CardHeader><CardContent className="space-y-4"><Input label="SEO H1" value={draft.seoH1 || ""} onChange={(e) => setDraft({ ...draft, seoH1: e.target.value })} /><Input label="SEO Title" value={draft.seoTitle || ""} onChange={(e) => setDraft({ ...draft, seoTitle: e.target.value })} /><Textarea label="SEO Description" rows={3} value={draft.seoDescription || ""} onChange={(e) => setDraft({ ...draft, seoDescription: e.target.value })} /></CardContent></Card>
          <div className="space-y-4">{draft.blocks.map((block, index) => <Card key={`${block.type}-${index}`}><CardHeader><div className="flex items-center justify-between gap-2"><CardTitle>{index + 1}. {BLOCK_TYPES.find((item) => item.value === block.type)?.label || block.type}</CardTitle><div className="flex gap-1"><Button type="button" size="sm" variant="outline" disabled={index === 0} onClick={() => { const blocks = [...draft.blocks]; [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]]; setDraft({ ...draft, blocks }); }}><ArrowUp className="h-4 w-4" /></Button><Button type="button" size="sm" variant="outline" disabled={index === draft.blocks.length - 1} onClick={() => { const blocks = [...draft.blocks]; [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]]; setDraft({ ...draft, blocks }); }}><ArrowDown className="h-4 w-4" /></Button><Button type="button" size="sm" variant="outline" onClick={() => setDraft({ ...draft, blocks: draft.blocks.filter((_, i) => i !== index) })}><Trash2 className="h-4 w-4" /></Button></div></div></CardHeader><CardContent><BlockEditor block={block} onChange={(next) => { const blocks = [...draft.blocks]; blocks[index] = next; setDraft({ ...draft, blocks }); }} /></CardContent></Card>)}</div>
          <Card><CardContent className="pt-6"><div className="flex flex-col gap-3 md:flex-row"><select value={newBlockType} onChange={(e) => setNewBlockType(e.target.value as StaticPageBlockType)} className="min-h-11 flex-1 rounded-xl border border-gray-200 bg-white px-3">{BLOCK_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label} — {type.hint}</option>)}</select><Button type="button" variant="outline" onClick={addBlock}><Plus className="mr-2 h-4 w-4" />Добавить блок</Button></div></CardContent></Card>
          <div className="flex flex-wrap justify-between gap-3"><div>{selectedPath && <Button type="button" variant="outline" onClick={remove} className="text-red-600">Удалить страницу</Button>}</div><div className="flex gap-3">{draft.path && <a href={`http://localhost:3000${normalizePath(draft.path)}`} target="_blank" rel="noreferrer"><Button type="button" variant="outline">Открыть страницу</Button></a>}<Button type="button" onClick={save} disabled={saving}>{saving ? "Сохранение..." : "Сохранить страницу"}</Button></div></div>
        </div>
      </div>
    </div>
  );
}
