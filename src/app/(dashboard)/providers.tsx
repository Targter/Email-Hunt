"use client";

import { createContext, useContext } from "react";
import type { Session } from "next-auth";

type DashboardContextType = {
  user: Session["user"];
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({
  user,
  children,
}: {
  user: Session["user"];
  children: React.ReactNode;
}) {
  return (
    <DashboardContext.Provider value={{ user }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);

  if (!ctx) {
    throw new Error("useDashboard must be used inside DashboardProvider");
  }

  return ctx;
}
