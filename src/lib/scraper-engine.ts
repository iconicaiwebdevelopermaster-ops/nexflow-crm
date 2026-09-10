import dns from 'dns/promises';

// Junk email filters
const JUNK_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.css', '.js'];
const JUNK_DOMAINS = ['example.com', 'domain.com', 'email.com', 'sentry.io', 'wixpress.com', 'schema.org', 'cloudflare.com', 'w3.org', 'wordpress.org', 'gravatar.com'];

export function isJunkEmail(email: string): boolean {
  const lower = email.toLowerCase();
  if (JUNK_EXTENSIONS.some(ext => lower.endsWith(ext))) return true;
  if (JUNK_DOMAINS.some(d => lower.includes(d))) return true;
  if (lower.startsWith('u00') || lower.includes('%')) return true;
  return false;
}

// 1. Built-in Node.js DNS MX Mailbox Verifier (100% Free)
export async function verifyDomainMx(domain: string): Promise<boolean> {
  if (!domain || domain.includes('localhost') || domain.includes('example')) return false;
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0].replace('www.', '');
    const mxRecords = await dns.resolveMx(cleanDomain);
    return mxRecords && mxRecords.length > 0;
  } catch {
    return false;
  }
}

// 2. Fast HTML Website Contact Crawler
export async function crawlWebsiteForEmail(websiteUrl: string): Promise<string | null> {
  if (!websiteUrl || !websiteUrl.startsWith('http')) return null;

  const targetUrls = [
    websiteUrl,
    `${websiteUrl.replace(/\/$/, '')}/contact`,
    `${websiteUrl.replace(/\/$/, '')}/contact-us`,
    `${websiteUrl.replace(/\/$/, '')}/about`
  ];

  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml'
        }
      });
      clearTimeout(timeout);

      if (!res.ok) continue;
      const html = await res.text();

      // Check mailto links
      const mailtoMatches = html.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi);
      if (mailtoMatches) {
        for (const m of mailtoMatches) {
          const clean = m.replace(/mailto:/i, '').trim().toLowerCase();
          if (!isJunkEmail(clean)) return clean;
        }
      }

      // Check generic regex
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const matches = html.match(emailRegex);
      if (matches) {
        for (const e of matches) {
          const clean = e.trim().toLowerCase();
          if (!isJunkEmail(clean)) return clean;
        }
      }
    } catch {
      // Continue to next URL
    }
  }

  return null;
}

// 3. OpenStreetMap Overpass Global Harvester (100% Free & Unlimited)
export async function fetchFromOpenStreetMap(niche: string, city: string, limit: number = 20): Promise<any[]> {
  try {
    const cleanNiche = niche.toLowerCase();
    let tagQuery = `["amenity"~"restaurant|cafe|bar",i]`;

    if (cleanNiche.includes('dent') || cleanNiche.includes('clinic') || cleanNiche.includes('health') || cleanNiche.includes('doctor')) {
      tagQuery = `["amenity"~"dentist|clinic|doctors|hospital",i]`;
    } else if (cleanNiche.includes('estate') || cleanNiche.includes('realt') || cleanNiche.includes('property')) {
      tagQuery = `["office"~"estate_agent|property",i]`;
    } else if (cleanNiche.includes('tech') || cleanNiche.includes('soft') || cleanNiche.includes('agency') || cleanNiche.includes('saas')) {
      tagQuery = `["office"~"it|company|advertising",i]`;
    } else if (cleanNiche.includes('gym') || cleanNiche.includes('fit')) {
      tagQuery = `["leisure"~"fitness_centre|sports_centre",i]`;
    } else if (cleanNiche.includes('law') || cleanNiche.includes('attorney') || cleanNiche.includes('legal')) {
      tagQuery = `["office"~"lawyer|legal",i]`;
    }

    const overpassQuery = `
      [out:json][timeout:15];
      area["name"~"${city}",i]->.searchArea;
      (
        node${tagQuery}(area.searchArea);
        way${tagQuery}(area.searchArea);
      );
      out tags ${limit};
    `;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: overpassQuery,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const elements = data.elements || [];

    const results: any[] = [];
    for (const el of elements) {
      const tags = el.tags || {};
      if (!tags.name) continue;

      const company = tags.name;
      const website = tags.website || tags['contact:website'] || tags.url || '';
      const phone = tags.phone || tags['contact:phone'] || '';
      const email = tags.email || tags['contact:email'] || '';

      results.push({
        company,
        website: website.startsWith('http') ? website : website ? `https://${website}` : '',
        phone: phone || '',
        rawEmail: email || ''
      });
    }

    return results;
  } catch (err) {
    console.warn('OpenStreetMap harvester timeout/fail, switching to fallback');
    return [];
  }
}