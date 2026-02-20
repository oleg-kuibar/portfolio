/**
 * Parse Convex errors into user-friendly messages.
 * Handles rate-limit errors like:
 *   Uncaught ConvexError: {"kind":"RateLimited","name":"demoSession","retryAfter":3408}
 */
export function formatConvexError(e: any, fallback: string): string {
  const msg: string = e?.message || e?.data?.message || '';

  // Try to extract JSON from the error message
  const jsonMatch = msg.match(/\{[^}]*"kind"\s*:\s*"RateLimited"[^}]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const seconds = Math.ceil((parsed.retryAfter || 0) / 1000);
      if (seconds > 0) {
        return `Rate limited — try again in ${seconds}s`;
      }
      return 'Rate limited — please wait a moment';
    } catch {}
  }

  // Check for rate limit keywords in the raw message
  if (/rate.?limit/i.test(msg)) {
    return 'Rate limited — please wait a moment';
  }

  // ConvexError wraps the data field directly
  if (e?.data && typeof e.data === 'object' && e.data.kind === 'RateLimited') {
    const seconds = Math.ceil((e.data.retryAfter || 0) / 1000);
    if (seconds > 0) {
      return `Rate limited — try again in ${seconds}s`;
    }
    return 'Rate limited — please wait a moment';
  }

  return msg || fallback;
}
