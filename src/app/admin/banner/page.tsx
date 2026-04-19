"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";

interface BannerConfig {
  text: string;
  url: string;
  active: boolean;
}

export default function AdminBannerPage() {
  const router = useRouter();

  const [banner, setBanner] = useState<BannerConfig>({
    text: "",
    url: "",
    active: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  // Load current banner config
  useEffect(() => {
    fetch("/api/admin/banner")
      .then((r) => r.json())
      .then((data: BannerConfig) => {
        setBanner(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/banner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(banner),
      });
      if (!res.ok) {
        const err = await res.json();
        setMessage({ type: "err", text: err.error ?? "Erreur" });
      } else {
        setMessage({ type: "ok", text: "Bandeau mis à jour !" });
      }
    } catch {
      setMessage({ type: "err", text: "Erreur réseau" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-10">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à la carte
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Bandeau publicitaire
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Configure le bandeau déroulant affiché en bas de la carte.
        </p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          {/* Active toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-medium text-gray-700">
              Activer le bandeau
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={banner.active}
              onClick={() => setBanner((b) => ({ ...b, active: !b.active }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                banner.active ? "bg-sky-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  banner.active ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </label>

          {/* Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texte du bandeau
            </label>
            <input
              type="text"
              maxLength={300}
              value={banner.text}
              onChange={(e) =>
                setBanner((b) => ({ ...b, text: e.target.value }))
              }
              placeholder="Ex: Découvrez nos ailes chez KitePro — livraison gratuite !"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {banner.text.length}/300
            </p>
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de redirection
            </label>
            <div className="relative">
              <input
                type="url"
                value={banner.url}
                onChange={(e) =>
                  setBanner((b) => ({ ...b, url: e.target.value }))
                }
                placeholder="https://example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-9 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
              />
              {banner.url && (
                <a
                  href={banner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-500"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Preview */}
          {banner.text && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Aperçu</p>
              <div className="overflow-hidden rounded-lg bg-black/75 backdrop-blur-sm">
                <div className="flex items-center h-7 whitespace-nowrap text-xs text-white/90">
                  <span className="inline-flex animate-marquee">
                    {Array.from({ length: 6 }, (_, i) => (
                      <span key={i} className="px-4">
                        {banner.text} ·
                      </span>
                    ))}
                  </span>
                  <span className="inline-flex animate-marquee" aria-hidden>
                    {Array.from({ length: 6 }, (_, i) => (
                      <span key={i} className="px-4">
                        {banner.text} ·
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving || !banner.text || !banner.url}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>

          {message && (
            <p
              className={`text-sm text-center ${
                message.type === "ok" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
