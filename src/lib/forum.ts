/** Forum utility functions */

/** Format a date string as a readable French date.
 *  - Today: "Aujourd'hui à 14:30"
 *  - Yesterday: "Hier à 09:15"
 *  - This year: "12 avr. à 14:30"
 *  - Older: "12 avr. 2025"
 */
export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const time = date.toLocaleTimeString("fr", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return `Aujourd'hui à ${time}`;
  if (isYesterday) return `Hier à ${time}`;

  const sameYear = date.getFullYear() === now.getFullYear();
  const day = date.getDate();
  const month = date.toLocaleDateString("fr", { month: "short" });

  if (sameYear) return `${day} ${month} à ${time}`;
  return `${day} ${month} ${date.getFullYear()}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
