// Note: Unused imports removed to fix ESLint warnings
// These are available but not used in this service file

// Note: generateSessionSummary and generateSessionDiagnostics are implemented as server actions
// in /src/app/actions/session-diagnostics-actions.ts following the project pattern

// Placeholder exports to satisfy index.ts imports
export const generateSessionSummary = () => {
  throw new Error("Use generateSessionSummaryAction from /app/actions/session-diagnostics-actions.ts");
};

export const generateSessionDiagnostics = () => {
  throw new Error("Use generateSessionDiagnosticsAction from /app/actions/session-diagnostics-actions.ts");
};

/**
 * Combines session therapeutic analyses into a single analysis string
 * Pure function - no AI involved
 */
export function combineSessionAnalyses(
  analyses: Array<{
    core_module: string | null;
    process_module: string | null;
    utility_module: string | null;
    intensity: string;
    crisis: string;
    distortions: Array<{ type: string; severity: string }>;
    themes: Array<{ theme: string; frequency: string }>;
    core_beliefs: Array<{ belief: string }>;
    silent_rules: Array<{ rule: string; rigidity: string }>;
    behavioral_patterns: Array<{ type: string; severity: string }>;
    state: string;
    therapeutic_readiness: string;
  }>
): string {
  if (analyses.length === 0) {
    return "No therapeutic analyses available for this session.";
  }

  // Aggregate patterns across all analyses
  const aggregatedDistortions = analyses.flatMap((a) => a.distortions);
  const aggregatedThemes = analyses.flatMap((a) => a.themes);
  const aggregatedBeliefs = analyses.flatMap((a) => a.core_beliefs);
  const aggregatedRules = analyses.flatMap((a) => a.silent_rules);
  const aggregatedPatterns = analyses.flatMap((a) => a.behavioral_patterns);

  // Get most frequent/severe patterns
  const intensities = analyses.map((a) => a.intensity);
  const crisisLevels = analyses.map((a) => a.crisis);
  const readinessLevels = analyses.map((a) => a.therapeutic_readiness);

  const analysisText = `
Session Analysis Summary:
- Total analyses: ${analyses.length}
- Emotional intensity patterns: ${intensities.join(", ")}
- Crisis levels observed: ${crisisLevels.join(", ")}
- Therapeutic readiness: ${readinessLevels.join(", ")}

Distortions identified: ${aggregatedDistortions.map((d) => `${d.type} (${d.severity})`).join(", ")}
Recurring themes: ${aggregatedThemes.map((t) => `${t.theme} (${t.frequency})`).join(", ")}
Core beliefs emerged: ${aggregatedBeliefs.map((b) => b.belief).join("; ")}
Silent rules detected: ${aggregatedRules.map((r) => `${r.rule} (${r.rigidity})`).join("; ")}
Behavioral patterns: ${aggregatedPatterns.map((p) => `${p.type} (${p.severity})`).join(", ")}
  `.trim();

  return analysisText;
}
