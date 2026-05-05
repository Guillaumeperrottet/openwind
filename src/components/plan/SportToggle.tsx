"use client";

import type { SportType } from "@/types";

interface Props {
  value: SportType | "ALL";
  onChange: (v: SportType | "ALL") => void;
  includeAll?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function SportToggle({
  value,
  onChange,
  includeAll = false,
  size = "md",
  className = "",
}: Props) {
  const opts: { key: SportType | "ALL"; label: string; icon?: string }[] = [
    ...(includeAll ? [{ key: "ALL" as const, label: "Tous" }] : []),
    { key: "KITE" as const, label: "Kite", icon: "/icon_kite.png" },
    { key: "PARAGLIDE" as const, label: "Para", icon: "/icon_para.png" },
  ];

  const heightCls = size === "sm" ? "h-8" : "h-10";

  return (
    <div
      className={`inline-flex items-stretch rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-sm ${heightCls} ${className}`}
    >
      {opts.map(({ key, label, icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex-1 px-3 inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors ${
              active
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {icon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={icon}
                alt=""
                width={14}
                height={14}
                className="shrink-0"
              />
            )}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
