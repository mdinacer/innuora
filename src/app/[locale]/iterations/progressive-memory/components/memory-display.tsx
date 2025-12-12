"use client";

import { useState } from "react";
import type { ContinuousMemory } from "../types/continuous-memory.types";

interface MemoryDisplayProps {
  memory: ContinuousMemory | null;
}

export function MemoryDisplay({ memory }: MemoryDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!memory) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No memory yet. Start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg">Progressive Memory</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Sessions:</span>
          <span className="font-medium">{memory.sessionCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Last Updated:</span>
          <span className="font-medium">
            {new Date(memory.lastUpdated).toLocaleString()}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4 text-sm">
          {/* Life Context */}
          {Object.keys(memory.lifeContext.relationships).length > 0 && (
            <MemorySection title="Life Context">
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(memory.lifeContext.relationships).map(
                  ([key, value]) =>
                    value && (
                      <li key={key}>
                        <strong>{key}:</strong> {value}
                      </li>
                    )
                )}
                {memory.lifeContext.responsibilities.length > 0 && (
                  <li>
                    <strong>Responsibilities:</strong>{" "}
                    {memory.lifeContext.responsibilities.join(", ")}
                  </li>
                )}
              </ul>
            </MemorySection>
          )}

          {/* Emotional Patterns */}
          {memory.emotionalPatterns.recurringFeelings.length > 0 && (
            <MemorySection title="Emotional Patterns">
              <p>
                <strong>Feelings:</strong>{" "}
                {memory.emotionalPatterns.recurringFeelings.join(", ")}
              </p>
              {memory.emotionalPatterns.emotionalTriggers.length > 0 && (
                <p className="mt-1">
                  <strong>Triggers:</strong>{" "}
                  {memory.emotionalPatterns.emotionalTriggers.join(", ")}
                </p>
              )}
            </MemorySection>
          )}

          {/* Partner Dynamic */}
          {memory.relationalPatterns.withPartner && (
            <MemorySection title="Partner Dynamic">
              <p className="mb-2">
                <strong>Pattern:</strong>{" "}
                {memory.relationalPatterns.withPartner.pattern}
              </p>
              {memory.relationalPatterns.withPartner.underlyingDynamic && (
                <p>
                  <strong>Dynamic:</strong>{" "}
                  {memory.relationalPatterns.withPartner.underlyingDynamic}
                </p>
              )}
            </MemorySection>
          )}

          {/* Behavioral Patterns */}
          {memory.behavioralPatterns.whatSheDoesRepeatedly.length > 0 && (
            <MemorySection title="Behavioral Patterns">
              <ul className="list-disc list-inside space-y-1">
                {memory.behavioralPatterns.whatSheDoesRepeatedly
                  .slice(0, 3)
                  .map((behavior, i) => (
                    <li key={i}>{behavior}</li>
                  ))}
              </ul>
            </MemorySection>
          )}

          {/* Core Struggles */}
          {memory.coreStruggles.primaryThemes.length > 0 && (
            <MemorySection title="Core Struggles">
              <p className="mb-2">
                <strong>Themes:</strong>{" "}
                {memory.coreStruggles.primaryThemes.join(", ")}
              </p>
              {memory.coreStruggles.repeatingCycle && (
                <p>
                  <strong>Cycle:</strong> {memory.coreStruggles.repeatingCycle}
                </p>
              )}
            </MemorySection>
          )}

          {/* Underlying Beliefs */}
          {memory.underlyingBeliefs.aboutSelf.length > 0 && (
            <MemorySection title="Underlying Beliefs">
              <ul className="list-disc list-inside space-y-1">
                {memory.underlyingBeliefs.aboutSelf.slice(0, 2).map((belief, i) => (
                  <li key={i}>{belief}</li>
                ))}
              </ul>
            </MemorySection>
          )}

          {/* Protective Patterns */}
          {memory.protectivePatterns.coreProtection && (
            <MemorySection title="Protective Pattern">
              <p>{memory.protectivePatterns.coreProtection}</p>
            </MemorySection>
          )}

          {/* Progression */}
          {memory.progression.newAwareness.length > 0 && (
            <MemorySection title="Progression">
              {memory.progression.newAwareness.length > 0 && (
                <p className="mb-2">
                  <strong>New Awareness:</strong>{" "}
                  {memory.progression.newAwareness.slice(-2).join("; ")}
                </p>
              )}
              {memory.progression.shifts.length > 0 && (
                <p>
                  <strong>Shifts:</strong>{" "}
                  {memory.progression.shifts.slice(-2).join("; ")}
                </p>
              )}
            </MemorySection>
          )}
        </div>
      )}
    </div>
  );
}

function MemorySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-l-2 border-blue-500 pl-3">
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <div className="text-gray-700">{children}</div>
    </div>
  );
}
