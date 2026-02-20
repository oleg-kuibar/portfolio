import { useState } from 'react';

const SESSION_KEY = 'convex-demo-session-id';

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useSessionId(): string {
  const [sessionId] = useState(getOrCreateSessionId);
  return sessionId;
}
