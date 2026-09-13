"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Button } from "@/shared/ui";
import { aiDescriptionsApi, type AiDescriptionDraft } from "@/shared/api";

function findDescriptionTextarea(): HTMLTextAreaElement | null {
  const textareas = Array.from(document.querySelectorAll("textarea"));
  return (
    textareas.find((textarea) => {
      const container = textarea.parentElement;
      const label = container?.querySelector("label");
      return label?.textContent?.trim().startsWith("Описание") ?? false;
    }) || null
  );
}

function setReactTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value",
  )?.set;

  if (setter) setter.call(textarea, value);
  else textarea.value = value;

  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.dispatchEvent(new Event("change", { bubbles: true }));
}

export function AiProductDescriptionPanel({ productId }: { productId: string }) {
  const [draft, setDraft] = useState<AiDescriptionDraft | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [buttonHost, setButtonHost] = useState<HTMLElement | null>(null);
  const [previewHost, setPreviewHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    aiDescriptionsApi.getProductDraft(productId).then(setDraft).catch(() => null);
  }, [productId]);

  useEffect(() => {
    let attempts = 0;
    let timer: number | undefined;

    const mount = () => {
      const textarea = findDescriptionTextarea();
      if (!textarea) {
        attempts += 1;
        if (attempts < 40) timer = window.setTimeout(mount, 100);
        return;
      }

      const container = textarea.parentElement;
      const label = container?.querySelector("label");
      if (!container || !label) return;

      const existingButton = container.querySelector<HTMLElement>(
        '[data-ai-description-button-host="true"]',
      );
      const existingPreview = container.querySelector<HTMLElement>(
        '[data-ai-description-preview-host="true"]',
      );

      const nextButtonHost = existingButton || document.createElement("span");
      nextButtonHost.dataset.aiDescriptionButtonHost = "true";
      nextButtonHost.className = "float-right ml-2 -mt-1";
      if (!existingButton) label.appendChild(nextButtonHost);

      const nextPreviewHost = existingPreview || document.createElement("div");
      nextPreviewHost.dataset.aiDescriptionPreviewHost = "true";
      nextPreviewHost.className = "mt-3";
      if (!existingPreview) textarea.insertAdjacentElement("afterend", nextPreviewHost);

      setButtonHost(nextButtonHost);
      setPreviewHost(nextPreviewHost);
    };

    mount();

    return () => {
      if (timer) window.clearTimeout(timer);
      document
        .querySelectorAll('[data-ai-description-button-host="true"], [data-ai-description-preview-host="true"]')
        .forEach((node) => node.remove());
    };
  }, []);

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

  const applyToField = () => {
    if (!draft?.text) return;
    const textarea = findDescriptionTextarea();
    if (!textarea) {
      setMessage("Поле описания не найдено. Обновите страницу и попробуйте снова.");
      return;
    }

    setReactTextareaValue(textarea, draft.text);
    textarea.focus();
    setMessage("AI-текст вставлен в поле «Описание». Нажмите «Сохранить», чтобы записать его в товар.");
  };

  if (!buttonHost || !previewHost) return null;

  return (
    <>
      {createPortal(
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void generate();
          }}
          disabled={busy === "generate"}
          className="inline-flex items-center rounded-lg border border-primary-orange/40 px-3 py-1 text-xs font-medium text-primary-orange hover:bg-orange-50 disabled:opacity-50"
        >
          {busy === "generate"
            ? "Генерация..."
            : draft?.text
              ? "✨ Сгенерировать заново"
              : "✨ Сгенерировать"}
        </button>,
        buttonHost,
      )}

      {createPortal(
        <div className="space-y-2">
          {message && (
            <div
              className={`text-xs ${
                message.startsWith("AI-текст вставлен") ? "text-green-700" : "text-red-600"
              }`}
            >
              {message}
            </div>
          )}

          {draft?.text && (
            <div className="rounded-lg border border-primary-orange/20 bg-orange-50/40 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-medium text-primary-black">
                  AI-вариант · {draft.status}
                </div>
                <Link
                  href="/ai-descriptions"
                  className="text-xs text-primary-orange hover:underline"
                >
                  Настройки GEN API →
                </Link>
              </div>
              <div className="text-sm whitespace-pre-wrap leading-relaxed text-primary-black">
                {draft.text}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={applyToField}
                >
                  Вставить в описание
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generate}
                  disabled={busy === "generate"}
                >
                  Сгенерировать заново
                </Button>
              </div>
              <p className="mt-2 text-xs text-text-secondary-black">
                Вставка меняет только поле формы. Товар обновится после обычной кнопки «Сохранить» сверху.
              </p>
            </div>
          )}

          {draft?.error && <div className="text-xs text-red-600">{draft.error}</div>}
        </div>,
        previewHost,
      )}
    </>
  );
}
