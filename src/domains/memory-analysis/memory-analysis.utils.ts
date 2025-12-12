import { FactualMemory, MemoryCue, MemoryIndex } from "@/domains/memory-analysis/memory-analysis.types";

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
