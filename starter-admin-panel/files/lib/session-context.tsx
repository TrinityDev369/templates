"use client";

import { createContext, useContext } from "react";

interface SessionData {
  sub: string;
  email: string;
  role: string;
}

const SessionContext = createContext<SessionData | null>(null);

export function SessionProvider({
  session,
  children,
}: {
  session: SessionData;
  children: React.ReactNode;
}) {
  return (
    <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionData {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within <SessionProvider>");
  return ctx;
}
