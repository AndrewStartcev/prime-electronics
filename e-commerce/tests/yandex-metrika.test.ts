import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  YANDEX_METRIKA_ID,
  YANDEX_METRIKA_WATCH_URL,
  getYandexMetrikaInitScript,
} from "../src/widgets/YandexMetrika/analytics.ts";

describe("Yandex Metrika", () => {
  it("uses the configured counter in both the loader and noscript fallback", () => {
    assert.equal(YANDEX_METRIKA_ID, 110546342);
    assert.equal(
      YANDEX_METRIKA_WATCH_URL,
      "https://mc.yandex.ru/watch/110546342",
    );
  });

  it("initializes the counter with the requested ecommerce and interaction options", () => {
    const script = getYandexMetrikaInitScript();

    assert.match(script, /metrika\/tag\.js\?id=110546342/);
    assert.match(script, /ym\(110546342, 'init'/);
    assert.match(script, /ecommerce:"dataLayer"/);
    assert.match(script, /webvisor:true/);
    assert.match(script, /trackLinks:true/);
  });
});
