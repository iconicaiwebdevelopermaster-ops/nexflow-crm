const tracker = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(ip: string, maxRequests: number = 20, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = tracker.get(ip);

  if (!record || now > record.expiresAt) {
    tracker.set(ip, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}