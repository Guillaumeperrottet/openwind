"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  // Supabase auto-exchanges the token from the URL hash on page load
  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      setDone(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
        {done ? (
          <div className="text-center py-4">
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Mot de passe mis à jour
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Vous pouvez maintenant vous connecter avec votre nouveau mot de
              passe.
            </p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-sky-600 text-white px-6 py-2.5 text-sm font-medium hover:bg-sky-700 transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Nouveau mot de passe
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {ready
                ? "Choisissez votre nouveau mot de passe."
                : "Chargement en cours…"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  required
                  minLength={6}
                  disabled={!ready}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirmer le mot de passe"
                required
                minLength={6}
                disabled={!ready}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none disabled:opacity-50"
              />

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading || !ready}
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-sky-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-sky-700 transition-colors disabled:opacity-50"
              >
                {loading && (
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                )}
                Mettre à jour le mot de passe
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
