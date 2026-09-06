"use client";

import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export const ShareButtons = ({ url, title }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : url;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = (platform: string) => {
    let shareLink = "";

    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "telegram":
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "width=600,height=400");
    }
  };

  return (
    <div className="flex items-center gap-[12px]">
      {/* Twitter/X */}
      <button
        onClick={() => handleShare("twitter")}
        className="w-[40px] h-[40px] md:w-[44px] md:h-[44px] rounded-full border border-[rgba(19,19,20,0.2)] flex items-center justify-center hover:border-[#ef6f2e] hover:text-[#ef6f2e] transition-colors"
        aria-label="Поделиться в Twitter"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      {/* Facebook */}
      <button
        onClick={() => handleShare("facebook")}
        className="w-[40px] h-[40px] md:w-[44px] md:h-[44px] rounded-full border border-[rgba(19,19,20,0.2)] flex items-center justify-center hover:border-[#ef6f2e] hover:text-[#ef6f2e] transition-colors"
        aria-label="Поделиться в Facebook"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
        </svg>
      </button>

      {/* Telegram */}
      <button
        onClick={() => handleShare("telegram")}
        className="w-[40px] h-[40px] md:w-[44px] md:h-[44px] rounded-full border border-[rgba(19,19,20,0.2)] flex items-center justify-center hover:border-[#ef6f2e] hover:text-[#ef6f2e] transition-colors"
        aria-label="Поделиться в Telegram"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z" />
        </svg>
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="w-[40px] h-[40px] md:w-[44px] md:h-[44px] rounded-full border border-[rgba(19,19,20,0.2)] flex items-center justify-center hover:border-[#ef6f2e] hover:text-[#ef6f2e] transition-colors relative"
        aria-label="Скопировать ссылку"
      >
        {copied ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )}
      </button>
    </div>
  );
};
