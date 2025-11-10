import { FactualMemory, MemoryCue } from "../analysis/types";

export function findMatchingFactualMemories(
  cues: MemoryCue[],
  memories: FactualMemory[],
  {
    entityWeight = 3,
    themeWeight = 2,
    peopleWeight = 1,
    minScore = 2, // ignore weak/noisy hits
  }: {
    entityWeight?: number;
    themeWeight?: number;
    peopleWeight?: number;
    minScore?: number;
  } = {}
): FactualMemory[] {
  const normalize = (arr?: string[]) => (arr ?? []).map((s) => s.toLowerCase().trim());

  const intersectCount = (a: string[], b: string[]) => a.filter((x) => b.includes(x)).length;

  const scored = new Map<FactualMemory, number>();

  for (const cue of cues) {
    const cueEntities = normalize(cue.entities);
    const cueThemes = normalize(cue.themes);
    const cuePeople = normalize(cue.people);

    for (const mem of memories) {
      const mEntities = normalize(mem.anchors.entities);
      const mThemes = normalize(mem.anchors.themes);
      const mPeople = normalize(mem.anchors.people);

      const score =
        intersectCount(cueEntities, mEntities) * entityWeight +
        intersectCount(cueThemes, mThemes) * themeWeight +
        intersectCount(cuePeople, mPeople) * peopleWeight;

      if (score >= minScore) {
        scored.set(mem, Math.max(score, scored.get(mem) ?? 0));
      }
    }
  }

  // Sort by descending score, stable by insertion
  return Array.from(scored.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([mem]) => mem);
}
