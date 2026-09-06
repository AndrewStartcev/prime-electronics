"use client";

import { type MouseEvent, useEffect, useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { SearchableSelect } from "./SearchableSelect";
import {
  useCreateProductVariantGroup,
  useDeleteProductVariantGroup,
  useProductVariantGroup,
  useProductVariantGroups,
  useUpdateProduct,
  useUpdateProductVariantGroup,
} from "@/shared/hooks";
import {
  getProductVariantOptionLabel,
  getProductVariantSummary,
} from "@/shared/lib";
import type {
  ProductVariantGroup,
  ProductVariantGroupProduct,
  ProductVariantGroupWithProducts,
} from "@/shared/api";

export type ProductVariantGroupValue = {
  variantGroupId: string;
  variantColor: string;
  variantMemory: string;
  variantSim: string;
};

type ProductVariantGroupEditorProps = {
  value: ProductVariantGroupValue;
  currentGroup?: ProductVariantGroupWithProducts | null;
  currentProductId?: string;
  onChange: (value: ProductVariantGroupValue) => void;
};

function formatPrice(value: string | number) {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numberValue)) return "";
  return `${new Intl.NumberFormat("ru-RU").format(numberValue)} ₽`;
}

function getProductOptionLabel(product: ProductVariantGroupProduct) {
  return getProductVariantOptionLabel(getProductVariantSummary(product));
}

function getGroupDescription(group: ProductVariantGroup) {
  const count =
    group._count?.products !== undefined
      ? `${group._count.products} товаров`
      : "Группа";

  return `${count} · ${group.id.slice(0, 8)}`;
}

export function ProductVariantGroupEditor({
  value,
  currentGroup,
  currentProductId,
  onChange,
}: ProductVariantGroupEditorProps) {
  const [search, setSearch] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [createdGroup, setCreatedGroup] = useState<ProductVariantGroup | null>(
    null,
  );
  const [renameName, setRenameName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const { data: groups = [], isLoading } = useProductVariantGroups(search);
  const shouldFetchSelectedGroup = Boolean(
    value.variantGroupId && currentGroup?.id !== value.variantGroupId,
  );
  const {
    data: selectedGroupDetails,
    isLoading: isSelectedGroupLoading,
  } = useProductVariantGroup(value.variantGroupId, {
    enabled: shouldFetchSelectedGroup,
  });
  const createGroup = useCreateProductVariantGroup();
  const updateGroup = useUpdateProductVariantGroup();
  const deleteGroup = useDeleteProductVariantGroup();
  const unlinkProduct = useUpdateProduct();

  const selectedKnownGroup =
    currentGroup?.id === value.variantGroupId
      ? currentGroup
      : selectedGroupDetails?.id === value.variantGroupId
        ? selectedGroupDetails
      : createdGroup?.id === value.variantGroupId
        ? createdGroup
        : groups.find((group) => group.id === value.variantGroupId);
  const selectedGroupName = selectedKnownGroup?.name || "";
  const selectedGroupCount =
    currentGroup?.id === value.variantGroupId
      ? currentGroup.products.length
      : selectedGroupDetails?.id === value.variantGroupId
        ? selectedGroupDetails.products.length
      : selectedKnownGroup && "_count" in selectedKnownGroup
        ? selectedKnownGroup._count?.products
        : undefined;
  const selectedGroupWithProducts =
    currentGroup?.id === value.variantGroupId
      ? currentGroup
      : selectedGroupDetails?.id === value.variantGroupId
        ? selectedGroupDetails
        : null;

  useEffect(() => {
    setRenameName(selectedGroupName);
  }, [selectedGroupName]);

  const groupOptions = groups.map((group) => ({
    value: group.id,
    label: group.name,
    description: getGroupDescription(group),
  }));

  if (
    createdGroup &&
    !groupOptions.some((option) => option.value === createdGroup.id)
  ) {
    groupOptions.unshift({
      value: createdGroup.id,
      label: createdGroup.name,
      description:
        createdGroup._count?.products !== undefined
          ? getGroupDescription(createdGroup)
          : "Новая группа",
    });
  }

  if (
    value.variantGroupId &&
    selectedGroupName &&
    !groupOptions.some((option) => option.value === value.variantGroupId)
  ) {
    groupOptions.unshift({
      value: value.variantGroupId,
      label: selectedGroupName,
      description:
        selectedGroupCount !== undefined
          ? `${selectedGroupCount} товаров · ${value.variantGroupId.slice(0, 8)}`
          : `Группа · ${value.variantGroupId.slice(0, 8)}`,
    });
  }

  const linkedProducts = selectedGroupWithProducts?.products || [];

  const updateValue = (patch: Partial<ProductVariantGroupValue>) => {
    onChange({ ...value, ...patch });
  };

  const handleGroupChange = (variantGroupId: string) => {
    updateValue({ variantGroupId });
    setStatusMessage(
      variantGroupId
        ? "Группа выбрана. Сохраните товар, чтобы привязка отобразилась на сайте и в списке связанных товаров."
        : "Группа снята. Сохраните товар, чтобы убрать привязку.",
    );
  };

  const handleCreateGroup = async () => {
    const name = newGroupName.trim();
    if (!name || createGroup.isPending) return;

    const group = await createGroup.mutateAsync({ name });
    setCreatedGroup(group);
    setNewGroupName("");
    setSearch("");
    updateValue({ variantGroupId: group.id });
    setStatusMessage(
      `Группа «${group.name}» создана и выбрана. Сохраните товар, чтобы он появился в группе.`,
    );
  };

  const handleRenameGroup = async () => {
    const name = renameName.trim();
    if (!value.variantGroupId || !name || updateGroup.isPending) return;
    if (name === selectedGroupName) return;

    const group = await updateGroup.mutateAsync({
      id: value.variantGroupId,
      data: { name },
    });
    setCreatedGroup((previous) =>
      previous?.id === group.id ? { ...previous, name: group.name } : previous,
    );
    setRenameName(group.name);
    setStatusMessage(`Группа переименована в «${group.name}».`);
  };

  const handleDeleteGroup = async () => {
    if (!value.variantGroupId || deleteGroup.isPending) return;

    const shouldDelete = window.confirm(
      "Удалить группу мультиобъявления? Товары останутся, но связь между ними будет разорвана.",
    );
    if (!shouldDelete) return;

    const result = await deleteGroup.mutateAsync(value.variantGroupId);
    setCreatedGroup((previous) =>
      previous?.id === result.id ? null : previous,
    );
    updateValue({ variantGroupId: "" });
    setStatusMessage(
      `Группа удалена. Связь разорвана у ${result.unlinkedProducts} товаров.`,
    );
  };

  const handleUnlinkProduct = async (
    event: MouseEvent<HTMLButtonElement>,
    product: ProductVariantGroupProduct,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (unlinkProduct.isPending) return;

    const shouldUnlink = window.confirm(
      `Убрать «${product.name}» из группы мультиобъявления?`,
    );
    if (!shouldUnlink) return;

    await unlinkProduct.mutateAsync({
      id: product.id,
      data: { variantGroupId: null },
    });

    if (product.id === currentProductId) {
      updateValue({ variantGroupId: "" });
    }

    setStatusMessage(`Товар «${product.name}» убран из группы.`);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div onChangeCapture={(event) => {
          const target = event.target as HTMLInputElement;
          setSearch(target.value || "");
        }}>
          <SearchableSelect
            label="Группа мультиобъявления"
            value={value.variantGroupId}
            options={groupOptions}
            onChange={handleGroupChange}
            disabled={isLoading}
            placeholder="Найти группу"
            emptyLabel="Группа не найдена"
            emptyValueLabel="Без группы"
            emptyOptionLabel="Без группы"
            emptyOptionDescription="Товар не связан с другими объявлениями"
            helperText="Все товары одной группы будут переключаться на сайте по цвету, памяти и SIM."
          />
        </div>

        <div className="flex flex-col gap-2">
          <Input
            label="Новая группа"
            value={newGroupName}
            onChange={(event) => setNewGroupName(event.target.value)}
            placeholder="Например, iPhone 15"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleCreateGroup}
            disabled={!newGroupName.trim() || createGroup.isPending}
          >
            {createGroup.isPending ? "Создание..." : "Создать группу"}
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div className="rounded-xl border border-primary-orange/30 bg-primary-orange/10 px-4 py-3 text-sm text-primary-black">
          {statusMessage}
        </div>
      )}

      {value.variantGroupId ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-text-secondary-black">
          Цвет, память, SIM и цена для переключения подтягиваются из связанных
          товаров и их характеристик. Ручные поля здесь больше не нужны.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Цвет"
            value={value.variantColor}
            onChange={(event) => updateValue({ variantColor: event.target.value })}
            placeholder="Черный"
          />
          <Input
            label="Память"
            value={value.variantMemory}
            onChange={(event) =>
              updateValue({ variantMemory: event.target.value })
            }
            placeholder="256 ГБ"
          />
          <Input
            label="SIM"
            value={value.variantSim}
            onChange={(event) => updateValue({ variantSim: event.target.value })}
            placeholder="nano-SIM + eSIM"
          />
        </div>
      )}

      {value.variantGroupId && (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-medium text-primary-black">
                Связанные товары
              </p>
              {selectedGroupName && (
                <p className="mt-0.5 text-xs text-text-secondary-black">
                  {selectedGroupName}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <Input
                label="Название группы"
                value={renameName}
                onChange={(event) => setRenameName(event.target.value)}
                placeholder="Название группы"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleRenameGroup}
                disabled={
                  !renameName.trim() ||
                  renameName.trim() === selectedGroupName ||
                  updateGroup.isPending
                }
              >
                {updateGroup.isPending ? "Сохранение..." : "Переименовать"}
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteGroup}
                disabled={deleteGroup.isPending}
              >
                {deleteGroup.isPending ? "Удаление..." : "Удалить группу"}
              </Button>
              {selectedGroupCount !== undefined && (
                <span className="mb-2 rounded-lg bg-secondary-gray px-2 py-1 text-xs text-text-secondary-black">
                  {selectedGroupCount}
                </span>
              )}
            </div>
          </div>
          {isSelectedGroupLoading ? (
            <p className="px-4 py-3 text-sm text-text-secondary-black">
              Загружаем состав группы...
            </p>
          ) : linkedProducts.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {linkedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-secondary-gray"
                >
                  <a href={`/products/${product.id}`} className="min-w-0">
                    <span className="block truncate font-medium text-primary-black">
                      {product.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-text-secondary-black">
                      {getProductOptionLabel(product) || "Параметры не указаны"}
                    </span>
                  </a>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-right text-xs text-text-secondary-black">
                      {formatPrice(product.price)}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(event) => handleUnlinkProduct(event, product)}
                      disabled={unlinkProduct.isPending}
                    >
                      Убрать
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-4 py-3 text-sm text-text-secondary-black">
              Список обновится после сохранения товара. Если выбрана новая
              группа, текущий товар появится здесь первым.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
