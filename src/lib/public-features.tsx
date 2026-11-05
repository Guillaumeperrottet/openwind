"use client";

import { createContext, useContext, type ReactNode } from "react";

const PublicFeatures = createContext({ water: false });
export function PublicFeaturesProvider({ water, children }: { water: boolean; children: ReactNode }) {
  return <PublicFeatures.Provider value={{ water }}>{children}</PublicFeatures.Provider>;
}
export const usePublicFeatures = () => useContext(PublicFeatures);
