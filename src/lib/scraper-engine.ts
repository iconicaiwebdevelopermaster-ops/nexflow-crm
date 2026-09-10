import dns from 'dns/promises';

// Junk filter
const JUNK_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.css', '.js'];
const JUNK_DOMAINS = ['example.com', 'domain.com', 'email.com', 'sentry.io', 'wixpress.com', 'schema.org', 'cloudflare.com', 'w3.org', 'wordpress.org', 'gravatar.com'];

export function isJunkEmail(email: string): boolean {
  const lower = email.toLowerCase();
  if (JUNK_EXTENSIONS.some(ext => lower.endsWith(ext))) return true;
  if (JUNK_DOMAINS.some(d => lower.includes(d))) return true;
  if (lower.startsWith('u00') || lower.includes('%')) return true;
  return false;
}

// 1. DNS MX Check
export async function verifyDomainMx(domain: string): Promise<boolean> {
  if (!domain || domain.includes('localhost') || domain.includes('example')) return false;
  try {
    const clean = domain.replace(/^https?:\/\//, '').split('/')[0].replace('www.', '');
    const mx = await dns.resolveMx(clean);
    return mx && mx.length > 0;
  } catch {
    return false;
  }
}

// 2. Real Website HTML Contact Crawler
export async function crawlWebsiteForEmail(websiteUrl: string): Promise<string | null> {
  if (!websiteUrl || !websiteUrl.startsWith('http')) return null;

  const targetUrls = [
    websiteUrl,
    `${websiteUrl.replace(/\/$/, '')}/contact`,
    `${websiteUrl.replace(/\/$/, '')}/contact-us`
  ];

  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

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

      // mailto:
      const mailto = html.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi);
      if (mailto) {
        for (const m of mailto) {
          const clean = m.replace(/mailto:/i, '').trim().toLowerCase();
          if (!isJunkEmail(clean)) return clean;
        }
      }

      // Regex
      const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const matches = html.match(regex);
      if (matches) {
        for (const e of matches) {
          const clean = e.trim().toLowerCase();
          if (!isJunkEmail(clean)) return clean;
        }
      }
    } catch {}
  }
  return null;
}

// 3. DuckDuckGo LIVE Organic Harvester (100% Free - Scrapes Real Live Search Results)
export async function fetchDuckDuckGoOrganic(query: string, limit: number = 20): Promise<any[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const html = await res.text();

    const results: { title: string; link: string; snippet: string }[] = [];
    const linkRegex = /<a class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    const snippetRegex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

    let match;
    const links: { href: string; title: string }[] = [];
    while ((match = linkRegex.exec(html)) !== null && links.length < limit) {
      const rawHref = match[1];
      let finalLink = rawHref;
      if (rawHref.includes('uddg=')) {
        try {
          const parsed = new URL('https:' + (rawHref.startsWith('//') ? rawHref : '//' + rawHref));
          finalLink = decodeURIComponent(parsed.searchParams.get('uddg') || rawHref);
        } catch {}
      }
      const cleanTitle = match[2].replace(/<[^>]+>/g, '').trim();
      links.push({ href: finalLink, title: cleanTitle });
    }

    const snippets: string[] = [];
    while ((match = snippetRegex.exec(html)) !== null && snippets.length < limit) {
      snippets.push(match[1].replace(/<[^>]+>/g, '').trim());
    }

    for (let i = 0; i < links.length; i++) {
      results.push({
        title: links[i].title,
        link: links[i].href,
        snippet: snippets[i] || ''
      });
    }

    return results;
  } catch (err) {
    console.warn('DuckDuckGo organic search skipped:', err);
    return [];
  }
}

// 4. OpenStreetMap GeoRadius Fast Harvester (100% Real Local Businesses)
export async function fetchOsmGeoRadius(niche: string, city: string, limit: number = 20): Promise<any[]> {
  try {
    // Fast Nominatim Geocoding
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`, {
      headers: { 'User-Agent': 'NexFlowCRM-Harvester/8.0' }
    });
    if (!geoRes.ok) return [];
    const geoData = await geoRes.json();
    if (!geoData || geoData.length === 0) return [];

    const lat = geoData[0].lat;
    const lon = geoData[0].lon;

    let tag = '["amenity"~"restaurant|cafe|bar|pub"]';
    const clean = niche.toLowerCase();
    if (clean.includes('dent') || clean.includes('clinic')) tag = '["amenity"~"dentist|clinic|doctors|hospital"]';
    else if (clean.includes('estate') || clean.includes('realt')) tag = '["office"~"estate_agent"]';
    else if (clean.includes('gym') || clean.includes('fit')) tag = '["leisure"~"fitness_centre|sports_centre"]';
    else if (clean.includes('tech') || clean.includes('soft') || clean.includes('agency')) tag = '["office"~"it|company|advertising"]';

    const opQuery = `[out:json][timeout:8];node${tag}(around:15000,${lat},${lon});out tags ${limit};`;
    const opRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: opQuery,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!opRes.ok) return [];
    const opData = await opRes.json();
    const elements = opData.elements || [];

    return elements
      .map((el: any) => ({
        company: el.tags?.name || '',
        phone: el.tags?.phone || el.tags?.['contact:phone'] || '',
        website: el.tags?.website || el.tags?.['contact:website'] || '',
        rawEmail: el.tags?.email || el.tags?.['contact:email'] || ''
      }))
      .filter((x: any) => x.company.length > 2);
  } catch {
    return [];
  }
}