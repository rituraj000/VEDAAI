import { SessionData } from "./types";

const globalForSessions = global as unknown as {
  sessionStore: Map<string, SessionData>;
};

export const sessionStore =
  globalForSessions.sessionStore ?? new Map<string, SessionData>();

globalForSessions.sessionStore = sessionStore;

export function saveSession(session: SessionData): void {
  sessionStore.set(session.sessionId, session);
}

export function getSession(sessionId: string): SessionData | undefined {
  return sessionStore.get(sessionId);
}

export function deleteSession(sessionId: string): boolean {
  return sessionStore.delete(sessionId);
}

export function updateSession(
  sessionId: string,
  partial: Partial<SessionData>
): SessionData | undefined {
  const existing = sessionStore.get(sessionId);
  if (!existing) return undefined;
  const updated = { ...existing, ...partial };
  sessionStore.set(sessionId, updated);
  return updated;
}
