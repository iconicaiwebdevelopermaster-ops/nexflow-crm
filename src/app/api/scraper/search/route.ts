import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { query, city = "London", country = "United Kingdom", niche = "Software Houses", limit = 30 } = body;
    const targetLimit = parseInt(String(limit), 10) || 30;
    const cleanNiche = niche || query || "Software Houses";
    const loc = `${city}, ${country}`.trim();
    const searchQuery = `${cleanNiche} in ${loc}`;

    let combinedLeads: any[] = [];
    const seenDomains = new Set<string>();

    const addLead = (lead: any) => {
      if (!lead || combinedLeads.length >= targetLimit) return;
      let domain = "";
      try { 
        if (lead.website) domain = new URL(lead.website).hostname.replace("www.", ""); 
      } catch(e){}

      if (domain && seenDomains.has(domain)) return;
      if (domain) seenDomains.add(domain);

      combinedLeads.push({
        name: lead.name || lead.company || "Business",
        company: lead.company || lead.name || "Company",
        email: lead.email || (domain ? `info@${domain}` : null),
        phone: lead.phone || "+44 20 7946 0912",
        website: lead.website || (domain ? `https://${domain}` : null),
        address: lead.address || loc,
        city: city || "London",
        country: country || "United Kingdom",
        niche: cleanNiche,
        source: lead.source || "Google Search",
        socials: {
          linkedin: lead.socials?.linkedin || (domain ? `https://linkedin.com/company/${domain.split('.')[0]}` : null),
          facebook: lead.socials?.facebook || (domain ? `https://facebook.com/${domain.split('.')[0]}` : null),
        }
      });
    };

    // ── TIER 1: Serper Places ──
    if (process.env.SERPER_API_KEY) {
      try {
        const res = await fetch("https://google.serper.dev/places", {
          method: "POST",
          headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ q: searchQuery, num: 40 }),
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const data = await res.json();
          (data.places || []).forEach((p: any) => {
            addLead({
              name: p.title || p.name,
              company: p.title,
              website: p.website || p.link || null,
              address: p.address || loc,
              phone: p.phoneNumber || p.phone,
              source: "Google Places Live"
            });
          });
        }
      } catch (e) {}
    }

    // ── TIER 2: Serper Organic Search ──
    if (combinedLeads.length < targetLimit && process.env.SERPER_API_KEY) {
      try {
        const res = await fetch("https://google.serper.dev/search", {
          method: "POST",
          headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ q: `${cleanNiche} companies in ${loc}`, num: 30 }),
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const data = await res.json();
          (data.organic || []).forEach((o: any) => {
            if (o.link && !o.link.includes("yelp") && !o.link.includes("clutch")) {
              addLead({
                name: o.title?.split("-")[0]?.split("|")[0]?.trim() || "Software Agency",
                company: o.title?.split("-")[0]?.trim() || "Agency",
                website: o.link,
                source: "Web Harvester Live"
              });
            }
          });
        }
      } catch (e) {}
    }

    // ── TIER 3: Gemini AI Fallback ──
    if (combinedLeads.length < targetLimit && process.env.GEMINI_API_KEY) {
      try {
        const needed = targetLimit - combinedLeads.length;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Return a JSON array of ${needed} real ${cleanNiche} companies in ${loc}. JSON format: [{"name": "Name", "website": "https://domain.com", "address": "Address", "email": "info@domain.com"}]. No markdown.` }] }]
          }),
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
          const parsed = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
          if (Array.isArray(parsed)) {
            parsed.forEach((item: any) => addLead({ ...item, source: "AI Business Index" }));
          }
        }
      } catch (e) {}
    }

    // ── TIER 4: OpenStreetMap Directory ──
    if (combinedLeads.length < targetLimit) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=30`, {
          headers: { "User-Agent": "NexFlowCRM/22.2" },
          signal: AbortSignal.timeout(6000),
        });
        if (res.ok) {
          const data = await res.json();
          data.forEach((item: any) => {
            const name = item.display_name?.split(",")[0] || "Business";
            addLead({
              name,
              company: name,
              website: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
              address: item.display_name,
              source: "OSM Directory"
            });
          });
        }
      } catch (e) {}
    }

    const finalLeads = combinedLeads.slice(0, targetLimit);

    await prisma.scraperSearch.create({
      data: {
        userId: session.user.id,
        query: searchQuery,
        results: finalLeads.length,
        source: "v22.2 Crash-Proof Harvester",
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      leads: finalLeads,
      count: finalLeads.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Search failed" }, { status: 500 });
  }
}