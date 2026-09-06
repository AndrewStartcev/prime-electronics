import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getColorSwatchStyle,
  sortColorOptions,
  sortSimOptions,
  sortStorageOptions,
} from "../src/entities/product/lib/variantOptions";

describe("product variant options", () => {
  it("sorts storage options from smallest to largest across GB and TB labels", () => {
    assert.deepEqual(
      sortStorageOptions(["2 ТБ", "1 ТБ", "256 ГБ", "512GB", "128 GB"]),
      ["128 GB", "256 ГБ", "512GB", "1 ТБ", "2 ТБ"],
    );
  });

  it("keeps color options in a stable semantic order", () => {
    assert.deepEqual(
      sortColorOptions([
        "Оранжевый",
        "Белый",
        "Черный",
        "Синий",
        "Натуральный титан",
      ]),
      ["Черный", "Белый", "Натуральный титан", "Синий", "Оранжевый"],
    );
  });

  it("keeps SIM options in a stable physical-to-digital order", () => {
    assert.deepEqual(
      sortSimOptions(["eSim + eSim", "2 SIM", "Nano Sim + eSim"]),
      ["Nano Sim + eSim", "2 SIM", "eSim + eSim"],
    );
  });

  it("uses semantic color swatches instead of product image swatches", () => {
    assert.deepEqual(getColorSwatchStyle("Оранжевый (Cosmic Orange)"), {
      backgroundColor: "#f47b20",
    });
    assert.deepEqual(getColorSwatchStyle("Синий (Deep Blue)"), {
      backgroundColor: "#1f2a44",
    });
    assert.deepEqual(getColorSwatchStyle("Голубой (Mist Blue)"), {
      backgroundColor: "#9ebdd2",
    });
    assert.deepEqual(getColorSwatchStyle("Лавандовый (Lavender)"), {
      backgroundColor: "#c1b0d6",
    });
  });

  it("renders combined colors as a multi-color gradient", () => {
    const style = getColorSwatchStyle("Синий/Оранжевый");
    assert.match(style.backgroundImage || "", /#365b91/);
    assert.match(style.backgroundImage || "", /#f47b20/);
  });
});
