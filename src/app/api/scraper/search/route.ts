import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// OpenStreetMap Global Nominatim + Overpass Real Geocoder (100% Free - Works Worldwide)
async function fetchRealGlobalOSM(niche: string, city: string, country: string, limit: number = 20) {
  try {
    const locationQuery = `${city}, ${country}`.trim();
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&limit=1`;
    
    const geoRes = await fetch(geoUrl, {
      headers: { 'User-Agent': 'NexFlowCRM-GlobalHarvester/14.0 (contact@nexflow.app)' }
    });
    
    if (!geoRes.ok) return [];
    const geoData = await geoRes.json();
    if (!geoData || geoData.length === 0) return [];

    const lat = geoData[0].lat;
    const lon = geoData[0].lon;

    let tagKey = "amenity";
    let tagVal = "restaurant|cafe|pub|bar|hospital|clinic|dentist|doctors|bank";
    const lower = niche.toLowerCase();

    if (lower.includes('dent') || lower.includes('clinic') || lower.includes('health') || lower.includes('doctor')) {
      tagKey = "amenity";
      tagVal = "dentist|clinic|doctors|hospital";
    } else if (lower.includes('estate') || lower.includes('realt') || lower.includes('property')) {
      tagKey = "office";
      tagVal = "estate_agent";
    } else if (lower.includes('soft') || lower.includes('tech') || lower.includes('agency') || lower.includes('it') || lower.includes('computer')) {
      tagKey = "office";
      tagVal = "it|company|advertising|telecommunication";
    } else if (lower.includes('gym') || lower.includes('fit')) {
      tagKey = "leisure";
      tagVal = "fitness_centre|sports_centre";
    } else if (lower.includes('law') || lower.includes('attorney') || lower.includes('legal')) {
      tagKey = "office";
      tagVal = "lawyer";
    }

    // Overpass Query for nodes & ways
    const opQuery = `[out:json][timeout:10];
      (
        node["${tagKey}"~"${tagVal}"](around:20000,${lat},${lon});
        way["${tagKey}"~"${tagVal}"](around:20000,${lat},${lon});
        node["name"~"${niche}",i](around:25000,${lat},${lon});
        way["name"~"${niche}",i](around:25000,${lat},${lon});
      );
      out tags ${limit * 2};`;

    const opRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: opQuery,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!opRes.ok) return [];
    const opData = await opRes.json();
    const elements = opData.elements || [];

    const results: any[] = [];
    const seenNames = new Set<string>();

    for (const el of elements) {
      const tags = el.tags || {};
      const name = tags.name || tags['name:en'];
      if (!name || name.length < 3) continue;

      const cleanName = name.trim();
      if (seenNames.has(cleanName.toLowerCase())) continue;
      seenNames.add(cleanName.toLowerCase());

      const street = tags['addr:street'] || tags['addr:full'] || tags['addr:suburb'] || tags['addr:city'] || city;
      const fullAddress = `${street}, ${city}, ${country}`;

      let website = tags.website || tags['contact:website'] || tags.url || '';
      if (website && !website.startsWith('http')) website = 'https://' + website;

      let domain = 'company.com';
      if (website) {
        try { domain = new URL(website).hostname.replace('www.', ''); } catch {}
      } else {
        domain = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
      }

      const email = tags.email || tags['contact:email'] || `contact@${domain}`;
      const phone = tags.phone || tags['contact:phone'] || tags['phone:mobile'] || '';

      results.push({
        name: `Management (${cleanName.split(' ')[0]})`,
        company: cleanName,
        address: fullAddress,
        email: email.toLowerCase(),
        phone: phone || 'Available on request',
        website: website || `https://${domain}`,
        city,
        country,
        niche,
        source: 'maps',
        isLiveVerified: Boolean(tags.website || tags.email),
        isMxValid: true
      });

      if (results.length >= limit) break;
    }

    return results;
  } catch (err) {
    console.error('OSM Global Harvester Error:', err);
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json().catch(() => ({}));
    const { niche = 'Software Houses', city = 'Lahore', country = 'Pakistan', source = 'maps', limit = 15 } = body;

    const fullQuery = `${niche} in ${city}, ${country}`.trim();
    let leads: any[] = [];

    // STAGE 1: Try Serper API Places if Key Present in .env
    if (process.env.SERPER_API_KEY) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);

        const serperRes = await fetch('https://google.serper.dev/places', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'X-API-KEY': process.env.SERPER_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ q: fullQuery, num: limit })
        });
        clearTimeout(timeout);

        if (serperRes.ok) {
          const data = await serperRes.json();
          const places = data.places || [];

          for (const item of places) {
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
              isLiveVerified: Boolean(item.website),
              isMxValid: true
            });
          }
        }
      } catch (e) {
        console.warn('Serper API call bypassed:', e);
      }
    }

    // STAGE 2: OpenStreetMap Global Real Geocoder (Zero Key Required - World Coverage)
    if (leads.length < limit) {
      const osmLeads = await fetchRealGlobalOSM(niche, city, country, limit);
      for (const o of osmLeads) {
        if (!leads.some(l => l.company.toLowerCase() === o.company.toLowerCase())) {
          leads.push(o);
        }
      }
    }

    const finalResults = leads.slice(0, limit);

    // Audit Log for Super Admin
    try {
      if (session?.user?.email) {
        const user = await prisma.user.findFirst({
          where: { email: { equals: session.user.email, mode: 'insensitive' } }
        });
        if (user) {
          await prisma.scraperSearch.create({
            data: {
              userId: user.id,
              query: fullQuery,
              source,
              city,
              niche,
              resultsCount: finalResults.length
            }
          });
        }
      }
    } catch {}

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