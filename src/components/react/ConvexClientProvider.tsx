import { type ReactNode, useMemo } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';

const CONVEX_URL = 'https://ceaseless-rooster-274.convex.cloud';

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => new ConvexReactClient(CONVEX_URL), []);
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
