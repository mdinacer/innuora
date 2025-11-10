import { FactualMemory, MemoryCue, MemoryIndex } from "./types";

export function buildMemoryIndex(memories: FactualMemory[]): MemoryIndex {
  const index: MemoryIndex = {
    entities: [],
    people: [],
    themes: [],
    temporal: [],
  };

  for (const mem of memories) {
    const { anchors } = mem;
    if (!anchors) continue;

    const add = (arr?: string[], target?: string[]) => {
      if (!arr || !target) return;
      for (const v of arr) {
        const val = v.trim().toLowerCase().replace(/\s+/g, "_");
        if (val && !target.includes(val)) target.push(val);
      }
    };

    add(anchors.entities, index.entities);
    add(anchors.people, index.people);
    add(anchors.themes, index.themes);

    // temporal cues sometimes live inside anchors.themes or entities (e.g., "8am", "june")
    const temporalCandidates = [...(anchors.themes || []), ...(anchors.entities || [])].filter((t) =>
      /^(?:\d{1,2} ?(am|pm)|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|summer|winter|morning|evening)$/.test(
        t.toLowerCase()
      )
    );
    add(temporalCandidates, index.temporal);
  }

  // prune empty
  for (const key of Object.keys(index) as (keyof MemoryIndex)[]) {
    if (!index[key].length) delete index[key];
  }

  return index;
}

export function recallMemoriesFromCues(cues: MemoryCue[], memories: FactualMemory[]): FactualMemory[] {
  if (!cues?.length || !memories?.length) return [];

  // Collect all normalized tokens from the cues
  const cueTokens = new Set<string>(
    cues.flatMap((c) => [
      ...(c.entities ?? []),
      ...(c.people ?? []),
      ...(c.themes ?? []),
      ...(c.concepts ?? []),
      ...(c.temporal ?? []),
    ])
  );

  const matches: FactualMemory[] = [];

  for (const memory of memories) {
    const memTokens = new Set<string>([
      ...(memory.anchors.entities ?? []),
      ...(memory.anchors.people ?? []),
      ...(memory.anchors.themes ?? []),
    ]);

    // check if at least one token overlaps
    const overlapScore = [...cueTokens].filter((t) => memTokens.has(t)).length;

    if (overlapScore >= 2) matches.push(memory);
  }

  // deduplicate by summary
  const unique = new Map<string, FactualMemory>();
  for (const mem of matches) {
    if (!unique.has(mem.summary)) unique.set(mem.summary, mem);
  }

  return Array.from(unique.values());
}

/**
 * Checks if a factual memory and a memory cue refer to the same context.
 * Returns true when they share a significant overlap of anchors (people, entities, themes)
 * or a strong temporal alignment.
 */
function isCueMatchingMemory(memory: FactualMemory, cue: MemoryCue, threshold: number = 0.5): boolean {
  const intersect = (a: string[] = [], b: string[] = []) => a.filter((x) => b.includes(x));

  const totalPossible =
    (memory.anchors.people?.length || 0) +
    (memory.anchors.entities?.length || 0) +
    (memory.anchors.themes?.length || 0) +
    (cue.people?.length || 0) +
    (cue.entities?.length || 0) +
    (cue.themes?.length || 0);

  if (totalPossible === 0) return false;

  const peopleMatch = intersect(memory.anchors.people, cue.people).length;
  const entitiesMatch = intersect(memory.anchors.entities, cue.entities).length;
  const themesMatch = intersect(memory.anchors.themes, cue.themes).length;
  const temporalMatch = cue.temporal?.some((t) => memory.summary.toLowerCase().includes(t)) ?? false;

  const score = (peopleMatch + entitiesMatch + themesMatch + (temporalMatch ? 1 : 0)) / (totalPossible / 2);

  return score >= threshold;
}

export function findMatchingMemories(
  memories: FactualMemory[],
  cues: MemoryCue[],
  threshold: number = 0.5
): { cue: MemoryCue; matches: FactualMemory[] }[] {
  if (!Array.isArray(memories) || !Array.isArray(cues)) return [];

  const results: { cue: MemoryCue; matches: FactualMemory[] }[] = [];

  for (const cue of cues) {
    const matched: FactualMemory[] = [];

    for (const mem of memories) {
      if (isCueMatchingMemory(mem, cue, threshold)) matched.push(mem);
    }

    if (matched.length > 0) {
      // Remove near-duplicate summaries and preserve the most specific entries
      const uniqueMatches = matched.filter((m, i, arr) => arr.findIndex((x) => x.summary === m.summary) === i);

      results.push({ cue, matches: uniqueMatches });
    }
  }

  return results;
}

export function findUnmatchedCues(memories: FactualMemory[], cues: MemoryCue[], threshold: number = 0.5): MemoryCue[] {
  if (!Array.isArray(memories) || !Array.isArray(cues)) return [];

  return cues.filter((cue) => {
    const hasMatch = memories.some((mem) => isCueMatchingMemory(mem, cue, threshold));
    return !hasMatch;
  });
}
