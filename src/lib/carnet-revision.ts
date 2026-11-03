import revisions from "@/content/carnet-reading-revision.json";

export { revisions as carnetRevisions };

export function revisedCarnetContent(revision: typeof revisions[number], original: string) {
  const summary = `## À retenir\n\n${revision.summary.map((point) => `- ${point}`).join("\n")}\n\n`;
  return summary + (revision.body ?? original.trimStart());
}
