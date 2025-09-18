"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface Props {
  role: 'user' | 'assistant' | 'system';
  children: React.ReactNode;
  timestamp?: number;
  className?: string;
}

export const MessageBubble: React.FC<Props> = ({
  role,
  children,
  timestamp,
  className
}) => {
  const isUser = role === 'user';
  const isSystem = role === 'system';

  return (
    <div className={cn(
      'flex w-full',
      {
        'justify-end': isUser,
        'justify-start': !isUser,
        'justify-center': isSystem
      }
    )}>
      <div className={cn(
        'max-w-[80%] rounded-lg px-4 py-2 break-words',
        {
          // User messages
          'bg-blue-600 text-white': isUser,
          // Assistant messages  
          'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100': role === 'assistant',
          // System messages
          'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm': isSystem,
        },
        className
      )}>
        {children}
        
        {timestamp && (
          <div className={cn(
            'text-xs mt-1 opacity-70',
            {
              'text-white': isUser,
              'text-gray-600 dark:text-gray-400': !isUser
            }
          )}>
            {new Date(timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
    </div>
  );
};