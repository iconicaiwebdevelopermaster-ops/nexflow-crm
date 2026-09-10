// Junk email filter list
const JUNK_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.css', '.js'];
const JUNK_DOMAINS = ['example.com', 'domain.com', 'email.com', 'sentry.io', 'wixpress.com', 'schema.org', 'cloudflare.com', 'w3.org', 'wordpress.org', 'gravatar.com'];

export function isJunkEmail(email: string): boolean {
  const lower = email.toLowerCase();
  if (JUNK_EXTENSIONS.some(ext => lower.endsWith(ext))) return true;
  if (JUNK_DOMAINS.some(d => lower.includes(d))) return true;
  if (lower.startsWith('u00') || lower.includes('%')) return true;
  return false;
}

// Fast HTML Live Crawler with 3.5s Timeout
export async function crawlWebsiteForEmail(websiteUrl: string): Promise<string | null> {
  if (!websiteUrl || !websiteUrl.startsWith('http')) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(websiteUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const html = await res.text();

    // 1. Check mailto: links (Highest accuracy)
    const mailtoMatches = html.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi);
    if (mailtoMatches) {
      for (const m of mailtoMatches) {
        const clean = m.replace(/mailto:/i, '').trim().toLowerCase();
        if (!isJunkEmail(clean)) return clean;
      }
    }

    // 2. Check full HTML Body Regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = html.match(emailRegex);
    if (matches) {
      for (const e of matches) {
        const clean = e.trim().toLowerCase();
        if (!isJunkEmail(clean)) return clean;
      }
    }
  } catch {
    // Non-blocking timeout
  }
  return null;
}