"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/shared/ui";
import { aiDescriptionsApi, type AiDescriptionBatch, type AiDescriptionDraft, type AiDescriptionSettings } from "@/shared/api";

export default function AiDescriptionsPage() {
  const [settings, setSettings] = useState<AiDescriptionSettings | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4.1");
  const [batch, setBatch] = useState<AiDescriptionBatch | null>(null);
  const [drafts, setDrafts] = useState<AiDescriptionDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const [settingsData, batchData, draftsData] = await Promise.all([
      aiDescriptionsApi.getSettings(),
      aiDescriptionsApi.getLatestBatch(),
      aiDescriptionsApi.listDrafts({ page: 1, limit: 50 }),
    ]);
    setSettings(settingsData);
    setModel(settingsData.model || "gpt-4.1");
    setBatch(batchData);
    setDrafts(draftsData.data);
    setLoading(false);
  };

  useEffect(() => {
    load().catch((error) => {
      console.error(error);
      setMessage("Не удалось загрузить раздел ИИ-описаний");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (batch?.status !== "PROCESSING") return;
    const timer = window.setInterval(() => load().catch(console.error), 3000);
    return () => window.clearInterval(timer);
  }, [batch?.status]);

  const progress = useMemo(() => {
    if (!batch?.total) return 0;
    return Math.round((batch.processed / batch.total) * 100);
  }, [batch]);

  const saveSettings = async () => {
    setBusy("settings");
    setMessage("");
    try {
      const next = await aiDescriptionsApi.saveSettings({
        apiKey: apiKey.trim() || undefined,
        model: model.trim(),
      });
      setSettings(next);
      setApiKey("");
      setMessage("Настройки сохранены");
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Не удалось сохранить настройки");
    } finally {
      setBusy("");
    }
  };

  const startBatch = async () => {
    if (!window.confirm("Запустить генерацию черновиков описаний для всех товаров? Текущие описания не будут изменены.")) return;
    setBusy("batch");
    setMessage("");
    try {
      const next = await aiDescriptionsApi.startBatch();
      setBatch(next);
      setMessage("Массовая генерация запущена");
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Не удалось запустить генерацию");
    } finally {
      setBusy("");
    }
  };

  const applyOne = async (productId: string) => {
    if (!window.confirm("Заменить текущее описание товара этим AI-вариантом?")) return;
    setBusy(productId);
    try {
      await aiDescriptionsApi.applyProduct(productId);
      await load();
    } finally {
      setBusy("");
    }
  };

  const regenerate = async (productId: string) => {
    setBusy(`regen:${productId}`);
    try {
      await aiDescriptionsApi.generateProduct(productId);
      await load();
    } finally {
      setBusy("");
    }
  };

  const applyAll = async () => {
    if (!window.confirm("Заменить описания у ВСЕХ товаров, для которых готов AI-черновик? Это массовое изменение.")) return;
    setBusy("apply-all");
    try {
      const result = await aiDescriptionsApi.applyAll();
      setMessage(`Применено описаний: ${result.applied}`);
      await load();
    } finally {
      setBusy("");
    }
  };

  if (loading) return <div className="p-6">Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">ИИ-описания товаров</h1>
        <p className="text-text-secondary-black mt-1">GEN API · сначала создаются черновики, текущие описания не меняются до явного применения.</p>
      </div>

      {message && <div className="rounded-lg border border-border-gray bg-white px-4 py-3 text-sm">{message}</div>}

      <Card>
        <CardHeader><CardTitle>GEN API</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">API key</label>
            <Input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={settings?.hasApiKey ? "Ключ сохранён. Введите новый только для замены" : "Введите GEN API key"} />
            <p className="text-xs text-text-secondary-black mt-1">Ключ не возвращается в браузер после сохранения.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Модель</label>
            <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="gpt-4.1" />
          </div>
          <Button type="button" variant="primary" onClick={saveSettings} disabled={busy === "settings"}>{busy === "settings" ? "Сохранение..." : "Сохранить настройки"}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Массовая генерация</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {batch ? (
            <>
              <div className="flex flex-wrap gap-5 text-sm">
                <span>Статус: <b>{batch.status}</b></span><span>{batch.processed} / {batch.total}</span><span>Готово: {batch.success}</span><span>Ошибки: {batch.failed}</span>
              </div>
              <div className="h-3 rounded-full bg-secondary-gray overflow-hidden"><div className="h-full bg-primary-orange transition-all" style={{ width: `${progress}%` }} /></div>
              <div className="text-sm text-text-secondary-black">{progress}%</div>
            </>
          ) : <p className="text-sm text-text-secondary-black">Генерация ещё не запускалась.</p>}
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="primary" onClick={startBatch} disabled={busy === "batch" || batch?.status === "PROCESSING"}>{busy === "batch" ? "Запуск..." : "Сгенерировать для всех товаров"}</Button>
            <Button type="button" variant="outline" onClick={applyAll} disabled={busy === "apply-all"}>Применить все готовые</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Последние AI-черновики</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div key={draft.productId} className="border border-border-gray rounded-lg p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><div className="font-medium">{draft.productName || draft.productId}</div><div className="text-xs text-text-secondary-black">Статус: {draft.status}</div></div>
                  <div className="flex gap-2">
                    <Link href={`/products/${draft.productId}/edit`}><Button type="button" variant="outline" size="sm">Открыть товар</Button></Link>
                    <Button type="button" variant="outline" size="sm" onClick={() => regenerate(draft.productId)} disabled={busy === `regen:${draft.productId}`}>Перегенерировать</Button>
                    {draft.text && draft.status !== "APPLIED" && <Button type="button" variant="primary" size="sm" onClick={() => applyOne(draft.productId)} disabled={busy === draft.productId}>Применить</Button>}
                  </div>
                </div>
                {draft.error && <div className="text-sm text-red-600">{draft.error}</div>}
                {draft.text && <div className="grid md:grid-cols-2 gap-3"><div><div className="text-xs font-medium mb-1">Текущее описание</div><div className="text-sm bg-secondary-gray rounded-lg p-3 whitespace-pre-wrap">{draft.currentDescription || "—"}</div></div><div><div className="text-xs font-medium mb-1">AI-вариант</div><div className="text-sm bg-secondary-gray rounded-lg p-3 whitespace-pre-wrap">{draft.text}</div></div></div>}
              </div>
            ))}
            {drafts.length === 0 && <p className="text-sm text-text-secondary-black">Черновиков пока нет.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
