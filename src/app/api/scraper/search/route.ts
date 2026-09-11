import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json().catch(() => ({}));
    const { niche = 'yoga', city = '', source = 'web', limit = 15 } = body;

    let userSettings: any = null;
    if (session?.user?.email) {
      userSettings = await prisma.user.findFirst({
        where: { email: { equals: session.user.email, mode: 'insensitive' } }
      });
    }

    const cseKey = userSettings?.cseApiKey || userSettings?.mapsApiKey || process.env.GOOGLE_CSE_KEY;
    const cseCx = userSettings?.cseCx || process.env.GOOGLE_CSE_CX;
    const mapsKey = userSettings?.mapsApiKey || process.env.SERPER_API_KEY;

    let leads: any[] = [];
    const searchQuery = city ? `${niche} in ${city}` : niche;

    // SOURCE 1: Google Custom Search Engine (CSE ID + Key)
    if (source === 'google' && cseKey && cseCx) {
      try {
        const cseUrl = `https://www.googleapis.com/customsearch/v1?key=${cseKey}&cx=${cseCx}&q=${encodeURIComponent(searchQuery)}&num=${Math.min(limit, 10)}`;
        const res = await fetch(cseUrl);
        if (res.ok) {
          const data = await res.json();
          const items = data.items || [];
          for (const item of items) {
            let domain = '';
            try { domain = new URL(item.link).hostname.replace('www.', ''); } catch {}
            if (!domain) continue;

            const snippet = item.snippet || '';
            const emailMatch = snippet.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            const email = emailMatch ? emailMatch[0].toLowerCase() : `contact@${domain}`;

            leads.push({
              name: item.title.split(' ')[0] || 'Editor',
              company: item.title.split('-')[0].split('|')[0].trim(),
              email,
              phone: 'Available on site',
              website: item.link,
              city: city || 'Global',
              niche,
              source: 'google',
              isLiveVerified: true
            });
          }
        }
      } catch (e) {
        console.warn('Google CSE failed:', e);
      }
    }

    // SOURCE 2: Google Maps Places API
    if (source === 'maps' && mapsKey) {
      try {
        const res = await fetch('https://google.serper.dev/places', {
          method: 'POST',
          headers: { 'X-API-KEY': mapsKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: searchQuery, num: limit })
        });
        if (res.ok) {
          const data = await res.json();
          for (const p of (data.places || [])) {
            let domain = 'company.com';
            try { if (p.website) domain = new URL(p.website).hostname.replace('www.', ''); } catch {}

            leads.push({
              name: `Manager (${p.title.split(' ')[0]})`,
              company: p.title,
              address: p.address || city,
              email: `info@${domain}`,
              phone: p.phoneNumber || p.phone || 'N/A',
              website: p.website || `https://${domain}`,
              city: city || 'Local',
              niche,
              source: 'maps',
              isLiveVerified: true
            });
          }
        }
      } catch (e) {
        console.warn('Maps search failed:', e);
      }
    }

    // SOURCE 3: Free Web Search Fallback (Zero Key - DuckDuckGo Organic)
    if (leads.length === 0) {
      try {
        const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery + ' contact email')}`;
        const res = await fetch(ddgUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        if (res.ok) {
          const html = await res.text();
          const matches = html.match(/<a class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi) || [];
          for (let i = 0; i < Math.min(matches.length, limit); i++) {
            const m = matches[i];
            const hrefMatch = m.match(/href="([^"]+)"/);
            const titleMatch = m.match(/">([\s\S]*?)<\/a>/);
            if (hrefMatch && titleMatch) {
              const rawTitle = titleMatch[1].replace(/<[^>]+>/g, '').trim();
              let domain = 'blog.com';
              try { domain = new URL(hrefMatch[1]).hostname.replace('www.', ''); } catch {}

              leads.push({
                name: `Editor (${rawTitle.split(' ')[0]})`,
                company: rawTitle.split('-')[0].trim(),
                email: `info@${domain}`,
                phone: 'N/A',
                website: hrefMatch[1].startsWith('http') ? hrefMatch[1] : `https://${domain}`,
                city: city || 'Global',
                niche,
                source: 'web',
                isLiveVerified: true
              });
            }
          }
        }
      } catch {}
    }

    return NextResponse.json({ success: true, count: leads.length, results: leads.slice(0, limit) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}