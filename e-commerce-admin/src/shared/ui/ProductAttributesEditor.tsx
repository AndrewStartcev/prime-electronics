"use client";

import { Button } from "./Button";
import { Input } from "./Input";
import {
  buildStoredAttributeName,
  isCardAttributeName,
  ProductAttributeInput,
  stripCardAttributePrefix,
} from "@/shared/lib";

interface ProductAttributesEditorProps {
  value: ProductAttributeInput[];
  onChange: (next: ProductAttributeInput[]) => void;
}

export function ProductAttributesEditor({
  value,
  onChange,
}: ProductAttributesEditorProps) {
  const addAttribute = () => {
    onChange([...value, { name: "", value: "" }]);
  };

  const removeAttribute = (index: number) => {
    onChange(value.filter((_, idx) => idx !== index));
  };

  const updateAttribute = (
    index: number,
    patch: { name?: string; value?: string; showInCard?: boolean },
  ) => {
    onChange(
      value.map((attribute, idx) => {
        if (idx !== index) return attribute;

        const nextName = patch.name ?? stripCardAttributePrefix(attribute.name);
        const nextShowInCard =
          patch.showInCard ?? isCardAttributeName(attribute.name);

        return {
          name: buildStoredAttributeName(nextName, nextShowInCard),
          value: patch.value ?? attribute.value,
        };
      }),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary-black">
            Характеристики товара
          </p>
          <p className="text-xs text-text-secondary-black mt-1">
            Добавляйте характеристики вручную. Галочка “В плитку” выводит
            характеристику в карточке товара на сайте.
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addAttribute}>
          Добавить характеристику
        </Button>
      </div>

      {value.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-5 text-sm text-text-secondary-black">
          Характеристик пока нет. Нажмите “Добавить характеристику”.
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((attribute, index) => {
            const cleanName = stripCardAttributePrefix(attribute.name);
            const showInCard = isCardAttributeName(attribute.name);

            return (
              <div
                key={`attribute-${index}`}
                className="grid grid-cols-1 gap-3 rounded-xl border border-gray-100 p-3 lg:grid-cols-[1fr_1fr_auto_auto]"
              >
                <Input
                  label="Название"
                  placeholder="Например: Материал"
                  value={cleanName}
                  onChange={(event) =>
                    updateAttribute(index, { name: event.target.value })
                  }
                />
                <Input
                  label="Значение"
                  placeholder="Например: Алюминий"
                  value={attribute.value}
                  onChange={(event) =>
                    updateAttribute(index, { value: event.target.value })
                  }
                />
                <label className="flex items-center gap-2 self-end rounded-lg border border-gray-200 px-3 py-3 text-sm text-primary-black">
                  <input
                    type="checkbox"
                    checked={showInCard}
                    onChange={(event) =>
                      updateAttribute(index, {
                        showInCard: event.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary-orange focus:ring-primary-orange"
                  />
                  В плитку
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="self-end h-[46px]"
                  onClick={() => removeAttribute(index)}
                >
                  Удалить
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
