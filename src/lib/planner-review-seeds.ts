import type { PlannerReview } from "@/lib/planner-review";

/** Dated documentary snapshots of planner profiles, not on-site approval.
 * Stored administrative reviews override these; catalogue edits invalidate them. */
export const starterReviews: Record<string, PlannerReview> = {
  cmnr312220004ijf6l2oobbhb: {
    version: 1,
    status: "DOCUMENTED",
    discipline: "WATER_KITE",
    fingerprint:
      "7b30b726d68a0ffa9d32fb63a2d553f5f8fb6c2fc0aef83aad875a6b3e1bf3c4",
    reviewedAt: "2026-10-22",
    expiresAt: "2027-01-20",
    sectors: [
      {
        from: 0,
        to: 45,
      },
    ],
    season: "CONDITIONAL",
    months: [],
    access: "CONDITIONAL",
    notes: {
      fr: "Profil documentaire : Bise N–NE. Les zones autorisées changent en été : vérifier le plan local, les baigneurs et la réserve naturelle avant la mise à l’eau. Ce profil ne valide pas la difficulté ni le stationnement de la fiche.",
      de: "Dokumentiertes Profil: Bise N–NE. Im Sommer gelten andere Zonen: lokalen Plan, Badebereiche und Naturschutzgebiet vor dem Start prüfen. Schwierigkeitsgrad und Parkangaben des Katalogs sind nicht bestätigt.",
      it: "Profilo documentato: Bise N–NE. In estate le zone cambiano: verificare il piano locale, i bagnanti e la riserva naturale prima di partire. Difficoltà e parcheggi della scheda non sono convalidati.",
      en: "Documented profile: N–NE Bise. Summer zones differ: check the local plan, swimmers and nature reserve before launching. Catalogue difficulty and parking information have not been verified.",
    },
    sources: [
      {
        title: "Kitesurf.ch — Yvonand, zones et Bise",
        url: "https://www.kitesurf.ch/spot-yvonand",
        covers: ["discipline", "directions", "season", "access"],
      },
    ],
  },
  cmnr30vtl0003ijf6ylndlqlf: {
    version: 1,
    status: "DOCUMENTED",
    discipline: "WATER_KITE",
    fingerprint:
      "ca5b1db02f83995dabc383eec5d10f8f5990fa2e513ef0e306c65de956b6c1ff",
    reviewedAt: "2026-10-22",
    expiresAt: "2027-01-20",
    sectors: [
      {
        from: 225,
        to: 315,
      },
    ],
    season: "CONDITIONAL",
    months: [],
    access: "CONDITIONAL",
    notes: {
      fr: "Le planificateur retient uniquement le secteur SW–NW décrit par Swisskite, plutôt que la Bise mentionnée dans le catalogue. Vérifier les zones de départ estivales, de baignade et de réserve. Niveau et stationnement non validés.",
      de: "Der Planer verwendet nur den von Swisskite beschriebenen Sektor SW–NW statt der Bise im Katalog. Sommerliche Startzonen, Badebereiche und Naturschutz prüfen. Niveau und Parkangaben nicht bestätigt.",
      it: "Il pianificatore usa solo il settore SW–NW descritto da Swisskite, invece della Bise indicata nel catalogo. Verificare zone estive di partenza, balneazione e riserva. Livello e parcheggi non convalidati.",
      en: "The planner uses only the SW–NW sector documented by Swisskite, rather than the Bise mentioned in the catalogue. Check summer launch zones, swimming areas and the nature reserve. Difficulty and parking are unverified.",
    },
    sources: [
      {
        title: "Swisskite — vents SW à NW",
        url: "https://www.swisskite.club/kopie-von-les-r%C3%A9gles",
        covers: ["discipline", "directions"],
      },
      {
        title: "Swisskite — zones et règles locales",
        url: "https://www.swisskite.club/les-vents",
        covers: ["season", "access"],
      },
    ],
  },
  cmnpsrvtw0012haf6y1i584sc: {
    version: 1,
    status: "NEEDS_REVIEW",
    discipline: "UNKNOWN",
    fingerprint:
      "018375895cba0a75408551b3ac7c3f10f23374e62a3593870e746071b68d4744",
    reviewedAt: "2026-10-22",
    expiresAt: "2027-01-20",
    sectors: [],
    season: "UNKNOWN",
    months: [],
    access: "UNKNOWN",
    notes: {
      fr: "Fiche à revoir : niveau débutant et eau plate contredisent le descriptif de vagues et de vent au large. Toutes les orientations sont renseignées. Exclue des recommandations en attendant une revue sourcée.",
      de: "Überprüfung nötig: Anfänger und Flachwasser widersprechen der Beschreibung mit Wellen und ablandigem Wind. Alle Windrichtungen sind eingetragen. Bis zur belegten Prüfung keine Empfehlung.",
      it: "Scheda da rivedere: principiante e acqua piatta contraddicono onde e vento da terra descritti. Sono indicate tutte le direzioni. Esclusa dai consigli in attesa di verifica con fonti.",
      en: "Review needed: beginner and flat-water labels contradict waves and offshore wind in the description. All directions are listed. Excluded from recommendations pending a sourced review.",
    },
    sources: [],
  },
  cmnpsrvbe000ghaf6693p6sod: {
    version: 1,
    status: "NEEDS_REVIEW",
    discipline: "SNOW_KITE",
    fingerprint:
      "202349b6b63556ea176c80b5de7d11b41007366b91812a13ebfa894f1fc33242",
    reviewedAt: "2026-10-22",
    expiresAt: "2027-01-20",
    sectors: [],
    season: "UNKNOWN",
    months: [],
    access: "UNKNOWN",
    notes: {
      fr: "Le descriptif concerne le snowkite. Ce lieu ne participe pas aux recommandations de kitesurf nautique. Accès, saison et secteurs restent à documenter auprès de sources locales.",
      de: "Die Beschreibung betrifft Snowkiten. Dieser Ort wird nicht für Kitesurfen auf dem Wasser empfohlen. Zugang, Saison und Sektoren benötigen lokale Quellen.",
      it: "La descrizione riguarda lo snowkite. Il luogo non viene consigliato per kitesurf in acqua. Accesso, stagione e settori devono essere documentati con fonti locali.",
      en: "The description concerns snowkiting. This location is excluded from water-kitesurf recommendations. Access, season and sectors still require local documentation.",
    },
    sources: [],
  },
  cmnpsrv6h000ahaf6dom2q6jp: {
    version: 1,
    status: "NEEDS_REVIEW",
    discipline: "SNOW_KITE",
    fingerprint:
      "a7d47920567ffb56d03bef4dad0c74c3fe97bb07ac6ec4dba074923db50a4986",
    reviewedAt: "2026-10-22",
    expiresAt: "2027-01-20",
    sectors: [],
    season: "UNKNOWN",
    months: [],
    access: "UNKNOWN",
    notes: {
      fr: "Le descriptif concerne le snowkite. Ce lieu ne participe pas aux recommandations de kitesurf nautique. Accès, saison et secteurs restent à documenter auprès de sources locales.",
      de: "Die Beschreibung betrifft Snowkiten. Dieser Ort wird nicht für Kitesurfen auf dem Wasser empfohlen. Zugang, Saison und Sektoren benötigen lokale Quellen.",
      it: "La descrizione riguarda lo snowkite. Il luogo non viene consigliato per kitesurf in acqua. Accesso, stagione e settori devono essere documentati con fonti locali.",
      en: "The description concerns snowkiting. This location is excluded from water-kitesurf recommendations. Access, season and sectors still require local documentation.",
    },
    sources: [],
  },
};
