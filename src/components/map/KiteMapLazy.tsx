"use client";

import dynamic from "next/dynamic";
import type { Spot } from "@/types";
import type { WindStation } from "@/lib/stations";

const KiteMap = dynamic(
  () => import("@/components/map/KiteMap").then((m) => m.KiteMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 relative">
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
          <div className="h-8 w-28 rounded-full bg-white/80 shadow animate-pulse" />
          <div className="h-7 w-36 rounded-full bg-white/80 shadow animate-pulse" />
        </div>
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
          <div className="h-18 w-8 rounded-lg bg-white/80 shadow animate-pulse" />
          <div className="h-8 w-8 rounded-full bg-white/80 shadow animate-pulse" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="animate-spin h-8 w-8 text-sky-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
              />
            </svg>
            <span className="text-sm text-gray-400 font-medium">
              Chargement de la carte…
            </span>
          </div>
        </div>
        <div className="absolute bottom-6 left-4 z-10">
          <div className="h-8 w-20 rounded-full bg-white/80 shadow animate-pulse" />
        </div>
      </div>
    ),
  },
);

interface Props {
  spots: Spot[];
  initialStations?: WindStation[];
}

export function KiteMapLazy({ spots, initialStations }: Props) {
  return <KiteMap spots={spots} initialStations={initialStations} />;
}
