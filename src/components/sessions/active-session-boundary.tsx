"use client";

import React, { useEffect } from "react";

import LoadingComponent from "@/components/loading-component";
import { useActiveSessionStore } from "@/domains/session-state";

interface Props {
  publicId: string;
  children: React.ReactNode;
}

export default function ActiveSessionBoundary({ publicId, children }: Props) {
  const isLoading = useActiveSessionStore((s) => s.isLoading);
  const error = useActiveSessionStore((s) => s.error);
  const session = useActiveSessionStore((s) => s.session);

  const openSession = useActiveSessionStore((s) => s.openSession);
  const closeSession = useActiveSessionStore((s) => s.closeSession);

  useEffect(() => {
    openSession(publicId);
    return () => closeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicId]);

  if (isLoading) return <LoadingComponent />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!session) return null;

  return children;
}
