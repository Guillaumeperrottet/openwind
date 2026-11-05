const names = [
  ["january", "janvier", "januar", "gennaio"], ["february", "fevrier", "februar", "febbraio"],
  ["march", "mars", "marz", "marzo"], ["april", "avril", "aprile"], ["may", "mai", "maggio"],
  ["june", "juin", "juni", "giugno"], ["july", "juillet", "juli", "luglio"],
  ["august", "aout", "agosto"], ["september", "septembre", "settembre"],
  ["october", "octobre", "oktober", "ottobre"], ["november", "novembre"], ["december", "decembre", "dezember", "dicembre"],
];
/** Audit legacy imports without inventing a season or modifying the catalogue. */
export function spotMonthNumber(value: string): number | null {
  const token = value.trim().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  if (/^(?:[1-9]|1[0-2])$/.test(token)) return Number(token);
  const index = names.findIndex(aliases => aliases.includes(token));
  return index < 0 ? null : index + 1;
}
export function normalizeSpotMonths(values: string[]): string[] {
  return [...new Set(values.map(spotMonthNumber).filter((n): n is number => n !== null))].sort((a, b) => a - b).map(String);
}
