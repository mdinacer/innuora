# V1 - Current (Broken) Flow Sandbox

This folder contains the **complete** current conversation flow isolated from all server infrastructure.

## Current Architecture (What's Running Now)

```
User Input
    ↓
1. Context Synthesis FIRST (using PREVIOUS analysis)
   - Model: GPT-4o-mini
   - Input: prevAnalysis, prevTrace, sessionDynamics
   - Output: contextDirective for current round
    ↓
2. PARALLEL: Reflection + Analysis
   ├─ Reflection (GPT-4o)
   │  └─ Uses: contextDirective (from step 1), prevAnalysis, prevTrace
   │  └─ Applies: Meta-gating, cooldown regulation, trace updates
   │
   └─ Analysis (GPT-4.1-mini)
      └─ Uses: userInput, messagesWindow, prevAnalyses
    ↓
3. Return reflection response
```

## Files

### Core Flow

- `flow.ts` - Two orchestration functions:
  - `runCurrentFlow()` - What's running now (BROKEN)
  - `runV7Flow()` - Attempted V7 (with TODOs where uncertain)
- `stages.ts` - Individual stage functions with all regulation logic
- `types.ts` - Input/Output types for each stage

### Prompts

- `prompts.ts` - All 3 stage prompts (reflection, analysis, synthesis)

### Regulation Logic (FULL COPY FROM PRODUCTION)

- `reflection-regulation.ts` - Cooldown logic, trace evolution, psychoeducation gating
  - `updateTraceFromOutput()` - Trace evolution with cooldown decay
  - `applyMetaGuidanceGating()` - Psychoeducation/curiosity suppression
  - `buildReflectionDirective()` - Dynamic gating directives
- `session-dynamics.ts` - Multi-scale emotional state computation
  - `updateSessionDynamicsMatrix()` - Computes micro/meso/macro emotional state
- `synthesis-utils.ts` - Context hash and directive prompt building
  - `computeContextHash()` - Stable emotional state fingerprint
  - `buildContextDirectivePrompt()` - Synthesis prompt builder

### Entry Point

- `index.ts` - Exports all functions for easy testing

## What's Wrong

According to the user, the correct V7 should be:

- Analysis takes minimal/no input (not messagesWindow + prevAnalyses)
- Reflection and (Analysis → Context Synthesis) run in parallel
- Context synthesis uses NEW analysis, generates context for NEXT round

## How to Use

1. **See current broken flow**: Look at `flow.ts:runCurrentFlow()`
2. **See attempted V7**: Look at `flow.ts:runV7Flow()` (has TODOs)
3. **Test isolation**: All regulation logic is here - no server/db dependencies
4. **Fix and verify**: Modify `runV7Flow()` to match your original design
