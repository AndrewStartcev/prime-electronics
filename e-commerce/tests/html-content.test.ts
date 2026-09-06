import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  htmlToPlainText,
  sanitizeRichTextHtml,
} from "../src/shared/lib/html.ts";

describe("catalog HTML descriptions", () => {
  it("preserves useful content markup", () => {
    const result = sanitizeRichTextHtml(
      '<h2 class="section-title">Подборка</h2><p>Текст <strong>описания</strong>.</p>',
    );

    assert.equal(
      result,
      '<h2 class="section-title">Подборка</h2><p>Текст <strong>описания</strong>.</p>',
    );
  });

  it("removes executable tags, event handlers, and unsafe links", () => {
    const result = sanitizeRichTextHtml(
      '<script>alert(1)</script><img src="https://example.com/image.jpg" onerror="alert(2)"><a href="javascript:alert(3)">Ссылка</a>',
    );

    assert.equal(
      result,
      '<img src="https://example.com/image.jpg" /><a>Ссылка</a>',
    );
  });

  it("creates a tag-free fallback for meta description", () => {
    assert.equal(
      htmlToPlainText("<p>Текст <strong>подборки</strong></p>"),
      "Текст подборки",
    );
  });
});
