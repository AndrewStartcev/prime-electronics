"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { useCallback, useRef, useEffect } from "react";
import { uploadImage } from "../api/upload";
import { toast } from "sonner";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Начните писать...",
  className = "",
}: RichTextEditorProps) {
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
      onChange(editor.getHTML());
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

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

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  if (!editor) {
    return null;
  }

  return (
    <div
      className={`border border-border-gray rounded-lg overflow-hidden ${className}`}
    >
      {/* Toolbar */}
      <div className="bg-secondary-gray border-b border-border-gray p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-white transition-colors ${
            editor.isActive("bold") ? "bg-white text-primary-orange" : ""
          }`}
          title="Жирный (Ctrl+B)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-white transition-colors ${
            editor.isActive("italic") ? "bg-white text-primary-orange" : ""
          }`}
          title="Курсив (Ctrl+I)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 4h6M8 20h6M14 4l-4 16"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-white transition-colors ${
            editor.isActive("underline") ? "bg-white text-primary-orange" : ""
          }`}
          title="Подчеркнутый (Ctrl+U)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 4v7a5 5 0 0010 0V4M5 20h14"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-white transition-colors ${
            editor.isActive("strike") ? "bg-white text-primary-orange" : ""
          }`}
          title="Зачеркнутый"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12h18M9 5h6a3 3 0 013 3M9 19h6a3 3 0 01-3-3"
            />
          </svg>
        </button>

        <div className="w-px h-8 bg-border-gray mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`px-3 py-2 rounded hover:bg-white transition-colors font-bold ${
            editor.isActive("heading", { level: 1 })
              ? "bg-white text-primary-orange"
              : ""
          }`}
          title="Заголовок 1"
        >
          H1
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`px-3 py-2 rounded hover:bg-white transition-colors font-bold ${
            editor.isActive("heading", { level: 2 })
              ? "bg-white text-primary-orange"
              : ""
          }`}
          title="Заголовок 2"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`px-3 py-2 rounded hover:bg-white transition-colors font-bold ${
            editor.isActive("heading", { level: 3 })
              ? "bg-white text-primary-orange"
              : ""
          }`}
          title="Заголовок 3"
        >
          H3
        </button>

        <div className="w-px h-8 bg-border-gray mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-white transition-colors ${
            editor.isActive("bulletList") ? "bg-white text-primary-orange" : ""
          }`}
          title="Маркированный список"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-white transition-colors ${
            editor.isActive("orderedList") ? "bg-white text-primary-orange" : ""
          }`}
          title="Нумерованный список"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4h18M3 12h18M3 20h18"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-white transition-colors ${
            editor.isActive("blockquote") ? "bg-white text-primary-orange" : ""
          }`}
          title="Цитата"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        <div className="w-px h-8 bg-border-gray mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 rounded hover:bg-white transition-colors ${
            editor.isActive({ textAlign: "left" })
              ? "bg-white text-primary-orange"
              : ""
          }`}
          title="Выровнять влево"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h10M4 18h14"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded hover:bg-white transition-colors ${
            editor.isActive({ textAlign: "center" })
              ? "bg-white text-primary-orange"
              : ""
          }`}
          title="Выровнять по центру"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M7 12h10M5 18h14"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded hover:bg-white transition-colors ${
            editor.isActive({ textAlign: "right" })
              ? "bg-white text-primary-orange"
              : ""
          }`}
          title="Выровнять вправо"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M10 12h10M6 18h14"
            />
          </svg>
        </button>

        <div className="w-px h-8 bg-border-gray mx-1" />

        {/* Link and Image */}
        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded hover:bg-white transition-colors ${
            editor.isActive("link") ? "bg-white text-primary-orange" : ""
          }`}
          title="Добавить ссылку"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded hover:bg-white transition-colors"
          title="Добавить изображение"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>

        <div className="w-px h-8 bg-border-gray mx-1" />

        {/* Code */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-white transition-colors ${
            editor.isActive("code") ? "bg-white text-primary-orange" : ""
          }`}
          title="Код"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-white transition-colors ${
            editor.isActive("codeBlock") ? "bg-white text-primary-orange" : ""
          }`}
          title="Блок кода"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>

        <div className="w-px h-8 bg-border-gray mx-1" />

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Отменить (Ctrl+Z)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Повторить (Ctrl+Shift+Z)"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
            />
          </svg>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleImageUpload(file);
          }
          // Reset input so the same file can be selected again
          e.target.value = "";
        }}
      />

      {/* Editor */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
