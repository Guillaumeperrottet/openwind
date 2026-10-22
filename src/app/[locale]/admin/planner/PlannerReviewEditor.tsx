"use client";
import { useState } from "react";
import type { PlannerReview } from "@/lib/planner-review";
import { addDays, localDate } from "@/lib/planner";

type Row = {
  spot: {
    id: string;
    name: string;
    description: string | null;
    difficulty: string;
    waterType: string;
    access: string | null;
    hazards: string | null;
    bestWindDirections: string[];
    bestMonths: string[];
  };
  fingerprint: string;
  review: PlannerReview | null;
};
const field =
  "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";
const clock = (minutes: number) =>
  `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
const topics = ["discipline", "directions", "season", "access"] as const;
const topicLabels = {
  discipline: "Discipline",
  directions: "Orientations",
  season: "Saison",
  access: "Accès",
};
export function PlannerReviewEditor() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [review, setReview] = useState<PlannerReview | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const patch = (data: Partial<PlannerReview>) => {
    setReview((r) => (r ? { ...r, ...data } : r));
    setConfirmed(false);
    setMessage("");
  };
  function choose(row: Row) {
    const today = localDate(new Date());
    setSelected(row);
    setConfirmed(false);
    setMessage("");
    setReview(
      row.review
        ? { ...row.review, fingerprint: row.fingerprint }
        : {
            version: 1,
            status: "NEEDS_REVIEW",
            discipline: "UNKNOWN",
            fingerprint: row.fingerprint,
            reviewedAt: today,
            expiresAt: addDays(today, 90),
            sectors: [],
            season: "UNKNOWN",
            months: [],
            access: "UNKNOWN",
            notes: { fr: "", de: "", it: "", en: "" },
            sources: [],
          },
    );
  }
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 text-slate-900">
      <h1 className="text-2xl font-semibold">
        Qualification des profils du planificateur
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        Revue documentaire de la discipline, des secteurs, de la saison et de
        l’accès. Une fiche sans revue actuelle reste consultable, hors
        recommandations. Toute modification pertinente de la fiche invalide la
        revue. Validité maximale : 180 jours.
      </p>
      <form
        className="my-6 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setMessage("");
          try {
            const res = await fetch(
              `/api/admin/planner-reviews?${new URLSearchParams({ q: query })}`,
            );
            if (!res.ok) throw Error();
            setRows(await res.json());
          } catch {
            setMessage("Recherche indisponible.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <input
          aria-label="Nom ou identifiant du spot"
          placeholder="Nom ou identifiant du spot"
          className={field}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          disabled={busy}
          className="min-h-11 rounded-lg bg-sky-800 px-4 text-white disabled:opacity-50"
        >
          Rechercher
        </button>
      </form>
      {!!rows.length && (
        <ul className="mb-6 grid gap-2 sm:grid-cols-2">
          {rows.map((r) => (
            <li key={r.spot.id}>
              <button
                type="button"
                className={`${field} text-left aria-pressed:border-sky-700 aria-pressed:bg-sky-50`}
                aria-pressed={r.spot.id === selected?.spot.id}
                onClick={() => choose(r)}
              >
                {r.spot.name} · {r.review?.status || "Sans revue"}
              </button>
            </li>
          ))}
        </ul>
      )}
      {selected && review && (
        <div className="grid items-start gap-6 md:grid-cols-[1fr_2fr]">
          <aside className="space-y-3 rounded-xl bg-slate-100 p-4 text-sm">
            <h2 className="font-semibold">
              {selected.spot.name} — catalogue actuel
            </h2>
            <p>{selected.spot.description}</p>
            <p>
              {selected.spot.difficulty} · {selected.spot.waterType}
            </p>
            <p>{selected.spot.bestWindDirections.join(", ")}</p>
            <p>{selected.spot.bestMonths.join(", ")}</p>
            <p>{selected.spot.access}</p>
            <p>{selected.spot.hazards}</p>
            {selected.review &&
              selected.review.fingerprint !== selected.fingerprint && (
                <p className="font-semibold text-amber-900">
                  La fiche a changé depuis la dernière revue. Vérifiez à nouveau
                  tous les sujets.
                </p>
              )}
          </aside>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!confirmed || busy) return;
              setBusy(true);
              setMessage("");
              try {
                const res = await fetch("/api/admin/planner-reviews", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ spotId: selected.spot.id, review }),
                });
                const body = await res.json();
                if (!res.ok) throw Error(body.error);
                setRows((rs) =>
                  rs.map((r) =>
                    r.spot.id === selected.spot.id ? { ...r, review } : r,
                  ),
                );
                setConfirmed(false);
                setMessage(
                  "Revue enregistrée. Le planificateur public utilise ce profil dès la prochaine recherche.",
                );
              } catch (e) {
                setMessage(
                  e instanceof Error ? e.message : "Enregistrement impossible.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Statut
                <select
                  className={field}
                  value={review.status}
                  onChange={(e) =>
                    patch({ status: e.target.value as PlannerReview["status"] })
                  }
                >
                  <option value="NEEDS_REVIEW">
                    À revoir — exclure des recommandations
                  </option>
                  <option value="DOCUMENTED">Profil documenté</option>
                </select>
              </label>
              <label className="text-sm">
                Discipline
                <select
                  className={field}
                  value={review.discipline}
                  onChange={(e) =>
                    patch({
                      discipline: e.target.value as PlannerReview["discipline"],
                    })
                  }
                >
                  {(
                    ["UNKNOWN", "WATER_KITE", "SNOW_KITE", "PARAGLIDE"] as const
                  ).map((v) => (
                    <option key={v} value={v}>
                      {
                        {
                          UNKNOWN: "À documenter",
                          WATER_KITE: "Kitesurf nautique",
                          SNOW_KITE: "Snowkite",
                          PARAGLIDE: "Parapente",
                        }[v]
                      }
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Date de revue
                <input
                  required
                  type="date"
                  className={field}
                  value={review.reviewedAt}
                  onChange={(e) => patch({ reviewedAt: e.target.value })}
                />
              </label>
              <label className="text-sm">
                Expiration
                <input
                  required
                  type="date"
                  className={field}
                  value={review.expiresAt}
                  onChange={(e) => patch({ expiresAt: e.target.value })}
                />
              </label>
              <label className="text-sm">
                Saison
                <select
                  className={field}
                  value={review.season}
                  onChange={(e) =>
                    patch({ season: e.target.value as PlannerReview["season"] })
                  }
                >
                  <option value="UNKNOWN">Non documentée</option>
                  <option value="CONDITIONAL">
                    Conditions saisonnières dans la note sourcée
                  </option>
                  <option value="MONTHS">Mois d’accès documentés</option>
                </select>
              </label>
              <label className="text-sm">
                Accès
                <select
                  className={field}
                  value={review.access}
                  onChange={(e) =>
                    patch({ access: e.target.value as PlannerReview["access"] })
                  }
                >
                  <option value="UNKNOWN">Non documenté</option>
                  <option value="CONDITIONAL">
                    Sous conditions locales sourcées
                  </option>
                  <option value="CLOSED">Fermé</option>
                </select>
              </label>
            </div>
            {review.season === "MONTHS" && (
              <fieldset>
                <legend className="text-sm">
                  Mois documentés (pas les meilleurs mois météo)
                </legend>
                <div className="flex flex-wrap gap-3">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <label
                      key={n}
                      className="flex min-h-11 items-center gap-1 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={review.months.includes(n)}
                        onChange={(e) =>
                          patch({
                            months: e.target.checked
                              ? [...review.months, n]
                              : review.months.filter((m) => m !== n),
                          })
                        }
                      />
                      {n}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">
                Secteurs précis en degrés, vent venant de (0° = nord, 90° = est)
              </legend>
              {review.sectors.map((s, i) => (
                <div key={i} className="mb-2 flex gap-2">
                  {(["from", "to"] as const).map((k) => (
                    <input
                      key={k}
                      required
                      type="number"
                      min="0"
                      max={k === "to" ? 360 : 359}
                      aria-label={`${k} secteur ${i + 1}`}
                      className={field}
                      value={s[k]}
                      onChange={(e) =>
                        patch({
                          sectors: review.sectors.map((v, j) =>
                            j === i ? { ...v, [k]: Number(e.target.value) } : v,
                          ),
                        })
                      }
                    />
                  ))}
                  <button
                    type="button"
                    className="min-h-11 px-2"
                    onClick={() =>
                      patch({
                        sectors: review.sectors.filter((_, j) => j !== i),
                      })
                    }
                  >
                    Retirer
                  </button>
                </div>
              ))}
              <button
                type="button"
                disabled={review.sectors.length >= 8}
                className="min-h-11 text-sm text-sky-800"
                onClick={() =>
                  patch({ sectors: [...review.sectors, { from: 0, to: 45 }] })
                }
              >
                + Ajouter un secteur
              </button>
            </fieldset>
            <fieldset className="space-y-3 rounded-xl border border-slate-200 p-3">
              <legend className="text-sm font-semibold">
                Fermetures appliquées au classement
              </legend>
              <p className="text-sm text-slate-600">
                Dates incluses, dans le fuseau du spot. Une période annuelle
                peut traverser le Nouvel An. Un séjour partiellement fermé
                conserve uniquement ses jours autorisés.
              </p>
              {(review.closures ?? []).map((closure, i) => (
                <div key={i} className="space-y-2 rounded-lg bg-slate-50 p-3">
                  <label className="block text-sm">
                    Type de fermeture {i + 1}
                    <select
                      className={field}
                      value={closure.kind}
                      onChange={(e) =>
                        patch({
                          closures: review.closures!.map((v, j) =>
                            j === i
                              ? {
                                  ...v,
                                  kind: e.target.value as "ANNUAL" | "DATED",
                                  start: "",
                                  end: "",
                                }
                              : v,
                          ),
                        })
                      }
                    >
                      <option value="ANNUAL">Chaque année</option>
                      <option value="DATED">
                        Dates précises, sans récurrence
                      </option>
                    </select>
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(["start", "end"] as const).map((key) => (
                      <label key={key} className="text-sm">
                        {key === "start" ? "Du (inclus)" : "Au (inclus)"}
                        <input
                          required
                          className={field}
                          type={closure.kind === "DATED" ? "date" : "text"}
                          placeholder={
                            closure.kind === "ANNUAL"
                              ? "MM-JJ, ex. 06-15"
                              : undefined
                          }
                          pattern={
                            closure.kind === "ANNUAL"
                              ? "[0-9]{2}-[0-9]{2}"
                              : undefined
                          }
                          value={closure[key]}
                          onChange={(e) =>
                            patch({
                              closures: review.closures!.map((v, j) =>
                                j === i ? { ...v, [key]: e.target.value } : v,
                              ),
                            })
                          }
                        />
                      </label>
                    ))}
                  </div>
                  {(["fr", "de", "it", "en"] as const).map((locale) => (
                    <label key={locale} className="block text-sm">
                      Motif {locale.toUpperCase()}
                      <input
                        required
                        minLength={12}
                        maxLength={2000}
                        className={field}
                        value={closure.reason[locale]}
                        onChange={(e) =>
                          patch({
                            closures: review.closures!.map((v, j) =>
                              j === i
                                ? {
                                    ...v,
                                    reason: {
                                      ...v.reason,
                                      [locale]: e.target.value,
                                    },
                                  }
                                : v,
                            ),
                          })
                        }
                      />
                    </label>
                  ))}
                  <label className="block text-sm">
                    Source de la fermeture
                    <select
                      required
                      className={field}
                      value={closure.sourceUrl}
                      onChange={(e) =>
                        patch({
                          closures: review.closures!.map((v, j) =>
                            j === i ? { ...v, sourceUrl: e.target.value } : v,
                          ),
                        })
                      }
                    >
                      <option value="">
                        Choisir une source d’accès ou de saison ci-dessous
                      </option>
                      {review.sources
                        .filter(
                          (s) =>
                            s.covers.includes("season") ||
                            s.covers.includes("access"),
                        )
                        .map((s, j) => (
                          <option key={j} value={s.url}>
                            {s.title}
                          </option>
                        ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="min-h-11 text-sm"
                    onClick={() =>
                      patch({
                        closures: review.closures!.filter((_, j) => j !== i),
                      })
                    }
                  >
                    Retirer cette fermeture
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="min-h-11 text-sm text-sky-800"
                disabled={(review.closures?.length ?? 0) >= 24}
                onClick={() =>
                  patch({
                    closures: [
                      ...(review.closures ?? []),
                      {
                        kind: "ANNUAL",
                        start: "",
                        end: "",
                        reason: { fr: "", de: "", it: "", en: "" },
                        sourceUrl: "",
                      },
                    ],
                  })
                }
              >
                + Ajouter une fermeture
              </button>
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!review.dailyHours}
                  onChange={(e) =>
                    patch({
                      dailyHours: e.target.checked
                        ? { from: 480, to: 1260, sourceUrl: "" }
                        : undefined,
                    })
                  }
                />
                Limiter les horaires locaux d’accès
              </label>
              {review.dailyHours && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {(["from", "to"] as const).map((key) => (
                    <label key={key} className="text-sm">
                      {key === "from"
                        ? "Ouverture locale"
                        : "Fermeture locale (00:00 = minuit suivant)"}
                      <input
                        required
                        type="time"
                        className={field}
                        value={clock(review.dailyHours![key])}
                        onChange={(e) =>
                          patch({
                            dailyHours: {
                              ...review.dailyHours!,
                              [key]:
                                e.target.value === "00:00" && key === "to"
                                  ? 1440
                                  : e.target.value
                                      .split(":")
                                      .reduce((h, v) => h * 60 + Number(v), 0),
                            },
                          })
                        }
                      />
                    </label>
                  ))}
                  <label className="text-sm sm:col-span-2">
                    Source des horaires
                    <select
                      required
                      className={field}
                      value={review.dailyHours.sourceUrl}
                      onChange={(e) =>
                        patch({
                          dailyHours: {
                            ...review.dailyHours!,
                            sourceUrl: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="">Choisir une source d’accès</option>
                      {review.sources
                        .filter((s) => s.covers.includes("access"))
                        .map((s, j) => (
                          <option key={j} value={s.url}>
                            {s.title}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
              )}
            </fieldset>
            {(["fr", "de", "it", "en"] as const).map((locale) => (
              <label key={locale} className="block text-sm">
                Note {locale.toUpperCase()} — conditions de saison et d’accès,
                limites de la revue
                <textarea
                  required
                  minLength={12}
                  maxLength={2000}
                  rows={4}
                  className={field}
                  value={review.notes[locale]}
                  onChange={(e) =>
                    patch({
                      notes: { ...review.notes, [locale]: e.target.value },
                    })
                  }
                />
              </label>
            ))}
            <fieldset>
              <legend className="text-sm font-semibold">
                Sources : couvrir les quatre sujets pour documenter un profil
              </legend>
              {review.sources.map((s, i) => (
                <div
                  key={i}
                  className="my-3 space-y-2 rounded-xl border border-slate-200 p-3"
                >
                  <input
                    required
                    aria-label={`Titre source ${i + 1}`}
                    className={field}
                    value={s.title}
                    onChange={(e) =>
                      patch({
                        sources: review.sources.map((v, j) =>
                          j === i ? { ...v, title: e.target.value } : v,
                        ),
                      })
                    }
                  />
                  <input
                    required
                    type="url"
                    placeholder="https://"
                    aria-label={`URL source ${i + 1}`}
                    className={field}
                    value={s.url}
                    onChange={(e) =>
                      patch({
                        sources: review.sources.map((v, j) =>
                          j === i ? { ...v, url: e.target.value } : v,
                        ),
                      })
                    }
                  />
                  <div className="flex flex-wrap gap-3">
                    {topics.map((t) => (
                      <label
                        key={t}
                        className="flex min-h-11 items-center gap-1 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={s.covers.includes(t)}
                          onChange={(e) =>
                            patch({
                              sources: review.sources.map((v, j) =>
                                j === i
                                  ? {
                                      ...v,
                                      covers: e.target.checked
                                        ? [...v.covers, t]
                                        : v.covers.filter((c) => c !== t),
                                    }
                                  : v,
                              ),
                            })
                          }
                        />
                        {topicLabels[t]}
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="min-h-11 text-sm"
                    onClick={() =>
                      patch({
                        sources: review.sources.filter((_, j) => j !== i),
                      })
                    }
                  >
                    Retirer cette source
                  </button>
                </div>
              ))}
              <button
                type="button"
                disabled={review.sources.length >= 10}
                className="min-h-11 text-sm text-sky-800"
                onClick={() =>
                  patch({
                    sources: [
                      ...review.sources,
                      { title: "", url: "", covers: [] },
                    ],
                  })
                }
              >
                + Ajouter une source
              </button>
            </fieldset>
            <label className="flex items-start gap-2 text-sm">
              <input
                required
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              J’ai revu la fiche actuelle et les sources. Les conditions
              saisonnières et les restrictions sont explicites dans les quatre
              langues.
            </label>
            <button
              disabled={!confirmed || busy}
              className="min-h-11 rounded-lg bg-sky-800 px-4 text-white disabled:opacity-40"
            >
              Enregistrer la revue
            </button>
          </form>
        </div>
      )}
      {message && (
        <p role="status" className="my-4 rounded-lg bg-slate-100 p-3 text-sm">
          {message}
        </p>
      )}
    </div>
  );
}
