"use client";

import { Suspense } from "react";

import LoadingComponent from "@/components/loading-component";

export default function Loading() {
  return (
    <Suspense>
      <LoadingComponent />
    </Suspense>
  );
}
