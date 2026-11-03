import { unified } from "unified";
import remarkParse from "remark-parse";
import { markdownText } from "./article-headings";
const parser = unified().use(remarkParse);
const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

/** Only an explicit, dated editorial statement counts, never an update timestamp. */
export function articleVerification(content: string, today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Zurich" }).format(new Date())): string | null {
  const matches = parser.parse(content).children.flatMap((node) => {
    if (node.type !== "paragraph") return [];
    const match = markdownText(node).match(/^Dernière vérification des sources officielles\s*:\s*(\d{1,2})\s+([a-zéûôîàè]+)\s+(\d{4})(?=[.\s]|$)/i);
    return match ? [match] : [];
  });
  const dates = matches.map((match) => {
    const month = months.indexOf(match[2].toLowerCase()) + 1;
    if (!month) return null;
    const date = `${match[3]}-${String(month).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
    const parsed = new Date(`${date}T12:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date && date <= today ? date : null;
  });
  return dates.length && dates.every((date) => date === dates[0]) ? dates[0] : null;
}
