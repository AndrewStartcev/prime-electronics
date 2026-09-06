"use client";

import { useRef, useState } from "react";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import type { SeoVariableOption } from "@/shared/lib/seoVariables";

export interface SeoFieldsValue {
  seoTitle: string;
  seoDescription: string;
  seoH1: string;
}

interface SeoFieldsProps {
  value: SeoFieldsValue;
  onChange: (value: SeoFieldsValue) => void;
  variables?: SeoVariableOption[];
  preview?: SeoFieldsValue;
}

type SeoFieldName = keyof SeoFieldsValue;

const previewLabels: Array<{ field: SeoFieldName; label: string }> = [
  { field: "seoTitle", label: "Title" },
  { field: "seoDescription", label: "Description" },
  { field: "seoH1", label: "H1" },
];

export function SeoFields({
  value,
  onChange,
  variables = [],
  preview,
}: SeoFieldsProps) {
  const [activeField, setActiveField] = useState<SeoFieldName>("seoTitle");
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const h1Ref = useRef<HTMLInputElement>(null);

  const fieldRefs = {
    seoTitle: titleRef,
    seoDescription: descriptionRef,
    seoH1: h1Ref,
  };

  const updateField = (field: keyof SeoFieldsValue, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  const insertVariable = (token: string) => {
    const input = fieldRefs[activeField].current;
    const currentValue = value[activeField];
    const selectionStart = input?.selectionStart ?? currentValue.length;
    const selectionEnd = input?.selectionEnd ?? currentValue.length;
    const nextValue =
      currentValue.slice(0, selectionStart) +
      token +
      currentValue.slice(selectionEnd);
    const nextCursorPosition = selectionStart + token.length;

    updateField(activeField, nextValue);
    requestAnimationFrame(() => {
      const nextInput = fieldRefs[activeField].current;
      nextInput?.focus();
      nextInput?.setSelectionRange(nextCursorPosition, nextCursorPosition);
    });
  };

  return (
    <div className="space-y-4">
      <Input
        ref={titleRef}
        label="Title"
        placeholder="[Название] купить в Prime Electronics"
        value={value.seoTitle}
        helperText={
          variables.length > 0
            ? "Можно использовать переменные ниже"
            : "Если пусто, сработает SEO-шаблон или название страницы"
        }
        onFocus={() => setActiveField("seoTitle")}
        onChange={(event) => updateField("seoTitle", event.target.value)}
      />
      <Textarea
        ref={descriptionRef}
        label="Description"
        placeholder="Краткое описание для поисковой выдачи"
        rows={3}
        value={value.seoDescription}
        helperText={
          variables.length > 0
            ? "Можно использовать переменные ниже"
            : "Можно оставить пустым и управлять через шаблоны"
        }
        onFocus={() => setActiveField("seoDescription")}
        onChange={(event) =>
          updateField("seoDescription", event.target.value)
        }
      />
      <Input
        ref={h1Ref}
        label="H1"
        placeholder="Заголовок на странице"
        value={value.seoH1}
        helperText={
          variables.length > 0
            ? "Можно использовать переменные ниже"
            : "Если пусто, будет использовано обычное название"
        }
        onFocus={() => setActiveField("seoH1")}
        onChange={(event) => updateField("seoH1", event.target.value)}
      />
      {variables.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <p className="mb-2 text-sm font-medium text-primary-black">
            Переменные
          </p>
          <div className="flex flex-wrap gap-2">
            {variables.map((variable) => (
              <button
                key={variable.token}
                type="button"
                title={variable.label}
                className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-primary-black transition-colors hover:border-primary-orange hover:text-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => insertVariable(variable.token)}
              >
                {variable.token}
              </button>
            ))}
          </div>
        </div>
      )}
      {preview && (
        <dl className="space-y-2 border-t border-gray-100 pt-4 text-sm">
          <dt className="font-medium text-primary-black">Предпросмотр</dt>
          {previewLabels.map(({ field, label }) => (
            <div key={field} className="grid gap-1 sm:grid-cols-[96px_minmax(0,1fr)]">
              <dd className="text-text-secondary-black">{label}</dd>
              <dd className="break-words text-primary-black">
                {preview[field] || "Не задано"}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
