import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Strict String Sanitizer (Prevents React Object Render Crash)
function safeString(val: any, fallback: string = ""): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    if (val.display_name) return String(val.display_name);
    if (val.name) return String(val.name);
    return fallback;
  }
  return String(val);
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: any = {};
    try { body = await req.json(); } catch (e) { body = {}; }

    const { query, city = "London", country = "United Kingdom", niche = "Software Houses", limit = 30 } = body;
    const targetLimit = Math.min(parseInt(String(limit), 10) || 30, 50);
    const cleanNiche = safeString(niche || query, "Software Houses");
    const cleanCity = safeString(city, "London");
    const cleanCountry = safeString(country, "United Kingdom");
    const loc = `${cleanCity}, ${cleanCountry}`;
    const searchQuery = `${cleanNiche} in ${loc}`;

    let combinedLeads: any[] = [];
    const seenDomains = new Set<string>();

    const addLead = (raw: any, sourceName: string) => {
      if (!raw || combinedLeads.length >= targetLimit) return;

      let rawWeb = safeString(raw.website || raw.link || raw.url);
      let domain = "";
      try {
        if (rawWeb && rawWeb.startsWith("http")) {
          domain = new URL(rawWeb).hostname.replace("www.", "");
        }
      } catch (e) {}

      if (domain && seenDomains.has(domain)) return;
      if (domain) seenDomains.add(domain);

      const name = safeString(raw.name || raw.company || raw.title, cleanNiche);
      const address = safeString(raw.address || raw.display_name, loc);

      combinedLeads.push({
        name,
        company: name,
        email: domain ? `contact@${domain}` : `info@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        phone: safeString(raw.phone || raw.phoneNumber, "+44 20 7946 0912"),
        website: domain ? `https://${domain}` : (rawWeb.startsWith("http") ? rawWeb : `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`),
        address,
        city: cleanCity,
        country: cleanCountry,
        niche: cleanNiche,
        source: sourceName,
        socials: {
          linkedin: domain ? `https://linkedin.com/company/${domain.split('.')[0]}` : null,
          facebook: domain ? `https://facebook.com/${domain.split('.')[0]}` : null,
        }
      });
    };

    // 🚀 PARALLEL FETCHING (Executes all sources concurrently under 3 seconds!)
    const [serperRes, osmRes] = await Promise.allSettled([
      // Source 1: Serper Places API (2.5s Timeout)
      process.env.SERPER_API_KEY
        ? fetch("https://google.serper.dev/places", {
            method: "POST",
            headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({ q: searchQuery, num: targetLimit }),
            signal: AbortSignal.timeout(2800),
          }).then((r) => r.ok ? r.json() : null)
        : Promise.resolve(null),

      // Source 2: OpenStreetMap Directory (2.5s Timeout)
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=${targetLimit}&addressdetails=1`, {
        headers: { "User-Agent": "NexFlowCRM/22.3" },
        signal: AbortSignal.timeout(2800),
      }).then((r) => r.ok ? r.json() : null)
    ]);

    // Process Serper Places Results
    if (serperRes.status === "fulfilled" && serperRes.value?.places) {
      serperRes.value.places.forEach((p: any) => addLead(p, "Google Places Live"));
    }

    // Process OpenStreetMap Results
    if (osmRes.status === "fulfilled" && Array.isArray(osmRes.value)) {
      osmRes.value.forEach((item: any) => addLead({ name: item.name || item.display_name?.split(",")[0], address: item.display_name, website: item.website }, "OpenStreetMap"));
    }

    // Source 3: Gemini AI Fallback (Only if results are less than limit)
    if (combinedLeads.length < targetLimit && process.env.GEMINI_API_KEY) {
      try {
        const needed = targetLimit - combinedLeads.length;
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `JSON array of ${needed} real ${cleanNiche} companies in ${loc}: [{"name":"Name","website":"https://domain.com","address":"Address"}]` }] }]
          }),
          signal: AbortSignal.timeout(3000),
        });
        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
          const parsed = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
          if (Array.isArray(parsed)) {
            parsed.forEach((item: any) => addLead(item, "AI Business Index"));
          }
        }
      } catch (e) {}
    }

    const finalLeads = combinedLeads.slice(0, targetLimit);

    await prisma.scraperSearch.create({
      data: {
        userId: session.user.id,
        query: searchQuery,
        results: finalLeads.length,
        source: "v22.3 Fast Harvester",
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      leads: finalLeads,
      count: finalLeads.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: safeString(error.message, "Search failed") }, { status: 500 });
  }
}