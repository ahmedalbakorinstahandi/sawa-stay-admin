"use client";

import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center">
      {children}
    </div>
  );
}
