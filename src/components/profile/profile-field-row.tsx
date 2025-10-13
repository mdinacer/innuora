/**
 * Reusable profile field display component
 * Reduces repetitive JSX rendering code
 */

import React from "react";

interface ProfileFieldRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export const ProfileFieldRow = React.memo<ProfileFieldRowProps>(({ label, value, className }) => {
  return (
    <div className={className || "grid grid-cols-3"}>
      <span className="text-sm text-inn-text-secondary">{label}</span>
      <span className="col-span-2">{value}</span>
    </div>
  );
});

ProfileFieldRow.displayName = "ProfileFieldRow";

interface ProfileFieldListProps {
  label: string;
  items: string[];
  className?: string;
}

export const ProfileFieldList = React.memo<ProfileFieldListProps>(({ label, items, className }) => {
  return (
    <div className={className || "grid grid-cols-3"}>
      <span className="text-sm text-inn-text-secondary">{label}</span>
      <ul className="list-disc list-inside col-span-2">
        {items.map((item, index) => (
          <li className="list-item" key={index}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
});

ProfileFieldList.displayName = "ProfileFieldList";
