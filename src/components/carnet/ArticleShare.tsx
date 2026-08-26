"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Mail,
  MessageCircle,
  Send,
  Share2,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface ArticleShareProps {
  title: string;
  text: string;
  url: string;
  articleSlug: string;
}

const secondaryButtonClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800";

export function ArticleShare({
  title,
  text,
  url,
  articleSlug,
}: ArticleShareProps) {
  const [copied, setCopied] = useState(false);

  function track(method: string) {
    trackEvent("share_article", {
      method,
      article_slug: articleSlug,
      content_type: "carnet_article",
    });
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    setCopied(true);
    track("copy_link");
    window.setTimeout(() => setCopied(false), 2200);
  }

  async function shareNative() {
    if (typeof navigator.share !== "function") {
      await copyUrl();
      return;
    }

    try {
      await navigator.share({ title, text, url });
      track("native");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title} — ${url}`);
  const encodedSubject = encodeURIComponent(title);
  const encodedBody = encodeURIComponent(`${text}\n\n${url}`);

  return (
    <section
      aria-labelledby="article-share-heading"
      className="border-y border-slate-200 py-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="article-share-heading"
            className="text-xs font-bold uppercase tracking-[0.17em] text-slate-500"
          >
            Partager ce Carnet
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Envoie-le à ta communauté ou garde le lien pour plus tard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={shareNative}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-sky-700 px-4 text-sm font-semibold text-white transition hover:bg-sky-800"
          >
            <Share2 className="h-4 w-4" />
            Partager
          </button>
          <button
            type="button"
            onClick={copyUrl}
            className={secondaryButtonClass}
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Lien copié" : "Copier"}
          </button>
          <a
            href={`https://wa.me/?text=${encodedText}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp")}
            className={secondaryButtonClass}
            aria-label="Partager sur WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp</span>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("facebook")}
            className={secondaryButtonClass}
            aria-label="Partager sur Facebook"
          >
            <Send className="h-4 w-4" />
            <span>Facebook</span>
          </a>
          <a
            href={`mailto:?subject=${encodedSubject}&body=${encodedBody}`}
            onClick={() => track("email")}
            className={secondaryButtonClass}
            aria-label="Partager par e-mail"
          >
            <Mail className="h-4 w-4" />
            <span>E-mail</span>
          </a>
        </div>
      </div>
    </section>
  );
}
