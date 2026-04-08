/** Forum utility functions */

export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "à l'instant";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `il y a ${weeks} sem.`;
  }

  if (days < 365) {
    const months = Math.floor(days / 30);
    return `il y a ${months} mois`;
  }

  const years = Math.floor(days / 365);
  return `il y a ${years} an${years > 1 ? "s" : ""}`;
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
