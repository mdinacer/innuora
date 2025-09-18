"use client";

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  className?: string;
  autoScroll?: boolean;
}

export const MessagesContainer: React.FC<Props> = ({
  children,
  className,
  autoScroll = true
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [children, autoScroll]);

  return (
    <div 
      ref={scrollRef}
      className={cn(
        'flex-1 overflow-y-auto p-4 space-y-4',
        'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600',
        'scrollbar-track-transparent',
        className
      )}
    >
      {children}
    </div>
  );
};