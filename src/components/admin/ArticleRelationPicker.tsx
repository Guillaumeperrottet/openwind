"use client";

import { Check, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

export interface ArticleRelationPickerOption {
  id: string;
  label: string;
  meta?: string;
}

interface Props {
  title: string;
  description: string;
  options: ArticleRelationPickerOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  loading?: boolean;
  emptyLabel: string;
}

export function ArticleRelationPicker({
  title,
  description,
  options,
  selectedIds,
  onChange,
  loading = false,
  emptyLabel,
}: Props) {
  const [query, setQuery] = useState("");
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const optionsById = useMemo(
    () => new Map(options.map((option) => [option.id, option])),
    [options],
  );
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    return options
      .filter((option) => {
        if (!normalizedQuery) return true;
        return `${option.label} ${option.meta ?? ""} ${option.id}`
          .toLocaleLowerCase("fr")
          .includes(normalizedQuery);
      })
      .slice(0, 40);
  }, [options, query]);

  function toggle(id: string) {
    onChange(
      selectedSet.has(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700">
          {selectedIds.length}
        </span>
      </div>

      {selectedIds.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {selectedIds.map((id) => {
            const option = optionsById.get(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                className="inline-flex max-w-full items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-left text-[11px] font-semibold text-white transition hover:bg-red-700"
                title="Retirer"
              >
                <span className="truncate">{option?.label ?? id}</span>
                <X className="h-3 w-3 shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher…"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        />
      </div>

      <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-1.5">
        {loading ? (
          <p className="px-2 py-3 text-xs text-slate-500">Chargement…</p>
        ) : filteredOptions.length === 0 ? (
          <p className="px-2 py-3 text-xs text-slate-500">{emptyLabel}</p>
        ) : (
          filteredOptions.map((option) => {
            const selected = selectedSet.has(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggle(option.id)}
                className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition ${
                  selected
                    ? "bg-sky-100 text-sky-950"
                    : "text-slate-700 hover:bg-white"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    selected
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {selected && <Check className="h-3 w-3" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold">
                    {option.label}
                  </span>
                  {option.meta && (
                    <span className="mt-0.5 block truncate text-[10px] text-slate-500">
                      {option.meta}
                    </span>
                  )}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
