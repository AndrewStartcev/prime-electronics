import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const sourcePath = path.resolve(
  "src/entities/product/lib/specifications.ts",
);
const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;

const cjsModule = { exports: {} };
vm.runInNewContext(compiled, {
  exports: cjsModule.exports,
  module: cjsModule,
  require,
});

const {
  buildProductSpecifications,
  shouldUsePhoneVariants,
} = cjsModule.exports;

const macbookName =
  "Apple MacBook Air 15 M4, 16ГБ, 256ГБ, 10-CPU, 10-GPU, Небесно-голубой (Sky Blue) [MC7A4]";
const macbookDescription =
  "Apple MacBook Air — это лёгкий и компактный ноутбук. Основные характеристики: Процессор: новейший чип M4 от Apple, обеспечивающий быструю работу. Память: большой объём оперативной памяти для многозадачности. Хранилище: быстрый SSD-накопитель. Дисплей: яркий экран с высоким разрешением. Батарея: длительное время работы от батареи.";

assert.equal(
  shouldUsePhoneVariants({
    name: macbookName,
    categories: [{ title: "Apple" }, { title: "Ноутбуки" }],
  }),
  false,
);

const specs = buildProductSpecifications({
  name: macbookName,
  description: macbookDescription,
  brandName: "Apple",
  categoryTitle: "Ноутбуки",
  totalStock: 2,
  baseSpecifications: [],
  optionSpecifications: [],
});

assert.equal(
  specs.some((spec) => spec.label === "Процессор" && spec.value.includes("M4")),
  true,
);
assert.equal(
  JSON.stringify(
    specs
      .filter((spec) => spec.label === "Оперативная память")
      .map((spec) => spec.value),
  ),
  JSON.stringify(["16 ГБ"]),
);
assert.equal(
  JSON.stringify(
    specs.filter((spec) => spec.label === "Накопитель").map((spec) => spec.value),
  ),
  JSON.stringify(["256 ГБ"]),
);
assert.equal(
  specs.some((spec) => spec.label === "CPU" && spec.value === "10 ядер"),
  true,
);
assert.equal(
  specs.some((spec) => spec.label === "GPU" && spec.value === "10 ядер"),
  true,
);
assert.equal(
  specs.some(
    (spec) =>
      spec.label === "Цвет" &&
      spec.value === "Небесно-голубой (Sky Blue)",
  ),
  true,
);
