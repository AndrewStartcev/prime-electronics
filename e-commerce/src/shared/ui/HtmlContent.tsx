import { sanitizeRichTextHtml } from "@/shared/lib/html";

interface HtmlContentProps {
  html: string;
  className?: string;
}

export function HtmlContent({ html, className = "" }: HtmlContentProps) {
  const safeHtml = sanitizeRichTextHtml(html);
  if (!safeHtml) return null;

  return (
    <div
      className={`blog-content ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
