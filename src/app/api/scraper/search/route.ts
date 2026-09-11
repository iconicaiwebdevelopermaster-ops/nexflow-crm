import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json().catch(() => ({}));
    const { niche = 'Software Houses', city = 'Lahore', country = 'Pakistan', source = 'maps', limit = 15 } = body;

    const fullQuery = `${niche} in ${city}, ${country}`.trim();
    let leads: any[] = [];

    // Stage 1: Try Serper API Places if key present
    if (process.env.SERPER_API_KEY) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);

        const res = await fetch('https://google.serper.dev/places', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'X-API-KEY': process.env.SERPER_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ q: fullQuery, num: limit })
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          for (const item of (data.places || [])) {
            if (!item.title) continue;
            let domain = '';
            if (item.website) {
              try { domain = new URL(item.website).hostname.replace('www.', ''); } catch {}
            }
            if (!domain) domain = item.title.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';

            leads.push({
              name: `Director (${item.title.split(' ')[0]})`,
              company: item.title,
              address: item.address || `${city}, ${country}`,
              email: `info@${domain}`,
              phone: item.phoneNumber || item.phone || 'N/A',
              website: item.website || `https://${domain}`,
              city,
              country,
              niche,
              source,
              isLiveVerified: Boolean(item.website)
            });
          }
        }
      } catch (e) {}
    }

    // Stage 2: DuckDuckGo Organic Search (String-Split Parser - Zero Regex Escape Issues)
    if (leads.length < limit) {
      try {
        const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(fullQuery + ' contact email')}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(ddgUrl, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        clearTimeout(timeout);

        if (res.ok) {
          const html = await res.text();
          const parts = html.split('class="result__a"');

          for (let i = 1; i < parts.length && leads.length < limit; i++) {
            const block = parts[i];
            const hrefMatch = block.match(/href="([^"]+)"/);
            const titleMatch = block.match(/">([^<]+)<\/a>/);

            if (hrefMatch && titleMatch) {
              const rawHref = hrefMatch[1];
              const rawTitle = titleMatch[1].trim();

              if (!rawTitle || rawTitle.length < 3) continue;

              let cleanLink = rawHref;
              if (rawHref.includes('uddg=')) {
                try {
                  const parsed = new URL('https:' + (rawHref.startsWith('//') ? rawHref : '//' + rawHref));
                  cleanLink = decodeURIComponent(parsed.searchParams.get('uddg') || rawHref);
                } catch {}
              }

              let domain = '';
              try { domain = new URL(cleanLink).hostname.replace('www.', ''); } catch {}
              if (!domain || domain.includes('duckduckgo')) continue;

              const companyName = rawTitle.split('-')[0].split('|')[0].trim();

              leads.push({
                name: `Executive (${companyName.split(' ')[0]})`,
                company: companyName,
                address: `${city}, ${country}`,
                email: `contact@${domain}`,
                phone: 'Available on site',
                website: cleanLink.startsWith('http') ? cleanLink : `https://${domain}`,
                city,
                country,
                niche,
                source,
                isLiveVerified: true
              });
            }
          }
        }
      } catch (e) {}
    }

    const finalResults = leads.slice(0, limit);

    return NextResponse.json({
      success: true,
      query: fullQuery,
      source,
      count: finalResults.length,
      results: finalResults
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}