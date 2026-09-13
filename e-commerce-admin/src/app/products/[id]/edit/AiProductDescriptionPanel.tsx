"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { aiDescriptionsApi, type AiDescriptionDraft } from "@/shared/api";

export function AiProductDescriptionPanel({ productId }: { productId: string }) {
  const [draft, setDraft] = useState<AiDescriptionDraft | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    aiDescriptionsApi.getProductDraft(productId).then(setDraft).catch(() => null);
  }, [productId]);

  const generate = async () => {
    setBusy("generate");
    setMessage("");
    try {
      const next = await aiDescriptionsApi.generateProduct(productId);
      setDraft(next);
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Не удалось сгенерировать описание");
    } finally {
      setBusy("");
    }
  };

  const apply = async () => {
    if (!window.confirm("Заменить текущее описание товара этим AI-вариантом?")) return;
    setBusy("apply");
    try {
      await aiDescriptionsApi.applyProduct(productId);
      window.location.reload();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Не удалось применить описание");
      setBusy("");
    }
  };

  return (
    <Card className="mb-4 lg:mb-6 border-primary-orange/30">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>✨ ИИ-описание</CardTitle>
          <Link href="/ai-descriptions" className="text-sm text-primary-orange hover:underline">Массовая генерация и настройки GEN API →</Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-text-secondary-black">Генерация создаёт черновик и не меняет описание товара, пока вы не нажмёте «Применить».</p>
        {message && <div className="text-sm text-red-600">{message}</div>}
        {draft?.text && (
          <div className="rounded-lg bg-secondary-gray p-4">
            <div className="text-xs font-medium mb-2">AI-вариант · {draft.status}</div>
            <div className="text-sm whitespace-pre-wrap leading-relaxed">{draft.text}</div>
          </div>
        )}
        {draft?.error && <div className="text-sm text-red-600">{draft.error}</div>}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={generate} disabled={busy === "generate"}>{busy === "generate" ? "Генерация..." : draft?.text ? "Сгенерировать заново" : "Сгенерировать описание"}</Button>
          {draft?.text && draft.status !== "APPLIED" && <Button type="button" variant="primary" onClick={apply} disabled={busy === "apply"}>{busy === "apply" ? "Применение..." : "Применить описание"}</Button>}
        </div>
      </CardContent>
    </Card>
  );
}
