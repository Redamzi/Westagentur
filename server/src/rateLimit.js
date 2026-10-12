/** Fixed-window rate limiter kept in memory. IPs are never persisted. */
export const createRateLimiter = ({ limit, windowMs }, clock = Date.now) => {
  const hits = new Map();

  const sweep = () => {
    const now = clock();
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
  };
  const timer = setInterval(sweep, windowMs);
  timer.unref?.();

  return {
    /** Returns true if the request is allowed. */
    hit(key) {
      const now = clock();
      const entry = hits.get(key);
      if (!entry || entry.resetAt <= now) {
        hits.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }
      entry.count += 1;
      return entry.count <= limit;
    },
    stop() {
      clearInterval(timer);
    },
  };
};
