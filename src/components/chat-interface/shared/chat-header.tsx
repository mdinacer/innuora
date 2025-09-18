"use client";

import React from 'react';
import { Session } from '@/lib/ai/mirael-core/v2/open-chat-session.types';
import { ChatMode } from '../types/chat.types';
import { cn } from '@/lib/utils';

interface Props {
  session: Session;
  mode: ChatMode;
  className?: string;
}

export const ChatHeader: React.FC<Props> = ({ 
  session, 
  mode,
  className 
}) => {
  const modeLabel = mode === 'flow' ? 'Guided Session' : 'Open Chat';
  
  return (
    <header className={cn(
      'flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-900',
      className
    )}>
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {session.title}
        </h1>
        {session.subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {session.subtitle}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <span className={cn(
          'px-2 py-1 text-xs font-medium rounded-full',
          {
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': mode === 'flow',
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': mode === 'open'
          }
        )}>
          {modeLabel}
        </span>
      </div>
    </header>
  );
};