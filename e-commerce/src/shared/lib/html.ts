import sanitizeHtml from "sanitize-html";

const allowedTags = [
  ...sanitizeHtml.defaults.allowedTags,
  "img",
  "figure",
  "figcaption",
];

const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  "*": ["class"],
  a: ["href", "name", "target", "rel", "title"],
  img: ["src", "alt", "title", "width", "height", "loading"],
};

export function sanitizeRichTextHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    enforceHtmlBoundary: true,
    transformTags: {
      a: (tagName, attributes) => ({
        tagName,
        attribs:
          attributes.target === "_blank"
            ? { ...attributes, rel: "noopener noreferrer" }
            : attributes,
      }),
    },
  });
}

export function htmlToPlainText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, " ")
    .trim();
}
