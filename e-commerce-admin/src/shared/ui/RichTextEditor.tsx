"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eye,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { uploadImage } from "../api/upload";
import { toast } from "sonner";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

interface ToolbarButtonProps {
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

function ToolbarButton({
  title,
  onClick,
  active = false,
  disabled = false,
  children,
  className = "",
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-9 min-w-9 px-2 inline-flex items-center justify-center rounded-md transition-colors hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed ${
        active ? "bg-white text-primary-orange shadow-sm" : "text-primary-black"
      } ${className}`}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function highlightHtml(value: string) {
  return value
    .split(/(<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<[^>]+>)/gi)
    .map((token) => {
      if (!token) return "";
      if (token.startsWith("<!--")) {
        return `<span class="text-emerald-700">${escapeHtml(token)}</span>`;
      }
      if (/^<!doctype/i.test(token)) {
        return `<span class="text-violet-700">${escapeHtml(token)}</span>`;
      }
      if (token.startsWith("<")) {
        return `<span class="text-blue-700">${escapeHtml(token)}</span>`;
      }
      return `<span class="text-slate-800">${escapeHtml(token)}</span>`;
    })
    .join("");
}

const RAW_ONLY_HTML_PATTERN =
  /<(?:table|thead|tbody|tfoot|tr|th|td|figure|figcaption|div|section|article|aside|header|footer|main|nav|form|iframe)\b|\s(?:itemscope|itemprop|itemtype|itemid|itemref)(?:\s|=|>)/i;

function requiresRawHtmlMode(value: string) {
  return RAW_ONLY_HTML_PATTERN.test(value);
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Начните писать...",
  className = "",
}: RichTextEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [htmlSource, setHtmlSource] = useState(content);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sourcePreRef = useRef<HTMLPreElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary-orange underline cursor-pointer",
        },
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      TextStyle,
      Color,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none min-h-[300px] px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => {
      if (isHtmlMode) return;
      const html = editor.getHTML();
      setHtmlSource(html);
      onChange(html);
    },
  });

  useEffect(() => {
    if (isHtmlMode) return;

    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
      setHtmlSource(content);
    }
  }, [editor, content, isHtmlMode]);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Введите URL:", previousUrl);
    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;

      try {
        toast.info("Загрузка изображения...");
        const result = await uploadImage(file);
        editor.chain().focus().setImage({ src: result.url }).run();
        toast.success("Изображение загружено!");
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Ошибка при загрузке изображения");
      }
    },
    [editor],
  );

  const addImage = useCallback(() => {
    if (!editor) return;
    fileInputRef.current?.click();
  }, [editor]);

  const toggleHtmlMode = useCallback(() => {
    if (!editor) return;

    if (isHtmlMode) {
      // Keep the code source canonical. Tiptap intentionally supports only a
      // subset of HTML and would otherwise drop tables, wrapper elements and
      // schema.org microdata when we switch back to the visual mode.
      editor.commands.setContent(htmlSource, { emitUpdate: false });
      setIsHtmlMode(false);
      return;
    }

    // Use the value from the form, not editor.getHTML(): the latter is already
    // normalized by Tiptap and can be lossy for arbitrary HTML.
    setHtmlSource(content);
    setIsHtmlMode(true);
  }, [content, editor, htmlSource, isHtmlMode]);

  const handleSourceChange = (value: string) => {
    setHtmlSource(value);
    onChange(value);
  };

  const handleSourceKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Tab") return;

    event.preventDefault();
    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const nextValue = `${htmlSource.slice(0, start)}  ${htmlSource.slice(end)}`;

    handleSourceChange(nextValue);
    requestAnimationFrame(() => {
      target.selectionStart = start + 2;
      target.selectionEnd = start + 2;
    });
  };

  const syncSourceScroll = (target: HTMLTextAreaElement) => {
    if (!sourcePreRef.current) return;
    sourcePreRef.current.scrollTop = target.scrollTop;
    sourcePreRef.current.scrollLeft = target.scrollLeft;
  };

  if (!editor) return null;

  const requiresRawMode = requiresRawHtmlMode(htmlSource);

  const shellClassName = isFullscreen
    ? "fixed inset-0 z-[100] bg-white flex flex-col"
    : `border border-border-gray rounded-lg overflow-hidden ${className}`;

  return (
    <div className={shellClassName}>
      <div className="bg-secondary-gray border-b border-border-gray p-2 flex flex-wrap items-center gap-1 shrink-0">
        {!isHtmlMode && !requiresRawMode && (
          <>
            <ToolbarButton
              title="Жирный (Ctrl+B)"
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton
              title="Курсив (Ctrl+I)"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton
              title="Подчеркнутый (Ctrl+U)"
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton
              title="Зачеркнутый"
              active={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="w-5 h-5" />
            </ToolbarButton>

            <div className="w-px h-8 bg-border-gray mx-1" />

            {([1, 2, 3] as const).map((level) => (
              <ToolbarButton
                key={level}
                title={`Заголовок ${level}`}
                active={editor.isActive("heading", { level })}
                className="font-semibold"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level }).run()
                }
              >
                H{level}
              </ToolbarButton>
            ))}

            <div className="w-px h-8 bg-border-gray mx-1" />

            <ToolbarButton
              title="Маркированный список"
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton
              title="Нумерованный список"
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton
              title="Цитата"
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="w-5 h-5" />
            </ToolbarButton>

            <div className="w-px h-8 bg-border-gray mx-1" />

            <ToolbarButton
              title="Выровнять влево"
              active={editor.isActive({ textAlign: "left" })}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton
              title="Выровнять по центру"
              active={editor.isActive({ textAlign: "center" })}
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
            >
              <AlignCenter className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton
              title="Выровнять вправо"
              active={editor.isActive({ textAlign: "right" })}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight className="w-5 h-5" />
            </ToolbarButton>

            <div className="w-px h-8 bg-border-gray mx-1" />

            <ToolbarButton
              title="Добавить ссылку"
              active={editor.isActive("link")}
              onClick={setLink}
            >
              <Link2 className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton title="Добавить изображение" onClick={addImage}>
              <ImagePlus className="w-5 h-5" />
            </ToolbarButton>

            <div className="w-px h-8 bg-border-gray mx-1" />

            <ToolbarButton
              title="Отменить (Ctrl+Z)"
              disabled={!editor.can().undo()}
              onClick={() => editor.chain().focus().undo().run()}
            >
              <Undo2 className="w-5 h-5" />
            </ToolbarButton>
            <ToolbarButton
              title="Повторить (Ctrl+Shift+Z)"
              disabled={!editor.can().redo()}
              onClick={() => editor.chain().focus().redo().run()}
            >
              <Redo2 className="w-5 h-5" />
            </ToolbarButton>
          </>
        )}

        {isHtmlMode && (
          <div className="px-2 text-sm font-medium text-slate-600">
            HTML-код · сохраняется без преобразований
          </div>
        )}

        {!isHtmlMode && requiresRawMode && (
          <div className="px-2 text-sm font-medium text-amber-700">
            Расширенный HTML защищён · редактируйте через режим кода
          </div>
        )}

        <div className="ml-auto flex items-center gap-1">
          <ToolbarButton
            title={isHtmlMode ? "Вернуться в визуальный редактор" : "Редактировать HTML"}
            active={isHtmlMode}
            onClick={toggleHtmlMode}
          >
            {isHtmlMode ? (
              <Eye className="w-5 h-5" />
            ) : (
              <Code2 className="w-5 h-5" />
            )}
          </ToolbarButton>
          <ToolbarButton
            title={isFullscreen ? "Выйти из полноэкранного режима" : "На весь экран"}
            active={isFullscreen}
            onClick={() => setIsFullscreen((value) => !value)}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </ToolbarButton>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) handleImageUpload(file);
          event.target.value = "";
        }}
      />

      {isHtmlMode ? (
        <div className={`relative bg-white ${isFullscreen ? "flex-1 min-h-0" : "min-h-[360px]"}`}>
          <pre
            ref={sourcePreRef}
            aria-hidden="true"
            className={`absolute inset-0 m-0 overflow-auto whitespace-pre p-4 font-mono text-sm leading-6 pointer-events-none bg-white ${
              isFullscreen ? "h-full" : "h-[420px]"
            }`}
            dangerouslySetInnerHTML={{
              __html: `${highlightHtml(htmlSource)}\n`,
            }}
          />
          <textarea
            value={htmlSource}
            onChange={(event) => handleSourceChange(event.target.value)}
            onKeyDown={handleSourceKeyDown}
            onScroll={(event) => syncSourceScroll(event.currentTarget)}
            placeholder={placeholder}
            spellCheck={false}
            wrap="off"
            className={`relative z-10 block w-full resize-none overflow-auto bg-transparent p-4 font-mono text-sm leading-6 text-transparent caret-slate-900 outline-none selection:bg-blue-200/70 ${
              isFullscreen ? "h-full" : "h-[420px]"
            }`}
          />
        </div>
      ) : requiresRawMode ? (
        <div
          className={`bg-white ${isFullscreen ? "flex-1 min-h-0 overflow-auto" : "min-h-[180px]"}`}
        >
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
            Безопасный предпросмотр. Сложный HTML редактируется только в режиме
            кода, чтобы не потерять таблицы, контейнеры и микроразметку.
          </div>
          <div
            className="rich-html-preview p-4 md:p-6"
            dangerouslySetInnerHTML={{ __html: htmlSource }}
          />
        </div>
      ) : (
        <div className={`bg-white overflow-auto ${isFullscreen ? "flex-1 min-h-0" : ""}`}>
          <EditorContent editor={editor} />
        </div>
      )}

      {isFullscreen && (
        <div className="shrink-0 border-t border-border-gray bg-white px-4 py-2 text-xs text-slate-500">
          Esc — выйти из полноэкранного режима · Tab — 2 пробела
        </div>
      )}
    </div>
  );
}