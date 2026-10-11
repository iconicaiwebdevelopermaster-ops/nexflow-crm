import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function safeStr(val: any, fallback: string = ""): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val.trim();
  return String(val).trim();
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { query, city, country, niche, limit = 30 } = body;
    
    const cleanNiche = safeStr(niche || query);
    const cleanCity = safeStr(city);
    const cleanCountry = safeStr(country);

    // Validation: Require User Inputs
    if (!cleanNiche) {
      return NextResponse.json({ error: "Please enter a Target Niche / Industry." }, { status: 400 });
    }
    if (!cleanCity && !cleanCountry) {
      return NextResponse.json({ error: "Please specify a City or Country." }, { status: 400 });
    }

    const targetLimit = Math.min(parseInt(String(limit), 10) || 30, 50);
    const loc = [cleanCity, cleanCountry].filter(Boolean).join(", ");
    const searchQuery = `${cleanNiche} in ${loc}`;

    const randomPage = Math.floor(Math.random() * 4) + 1;

    let combinedLeads: any[] = [];
    const seenDomains = new Set<string>();

    const addLead = (lead: any, sourceName: string) => {
      if (!lead || combinedLeads.length >= targetLimit) return;
      let rawWeb = safeStr(lead.website || lead.link);
      let domain = "";
      try { if (rawWeb.startsWith("http")) domain = new URL(rawWeb).hostname.replace("www.", ""); } catch (e) {}

      const name = safeStr(lead.name || lead.company, cleanNiche);
      const uniqueKey = domain || name.toLowerCase();

      if (seenDomains.has(uniqueKey)) return;
      seenDomains.add(uniqueKey);

      combinedLeads.push({
        name,
        company: name,
        email: lead.email || (domain ? `contact@${domain}` : null),
        phone: safeStr(lead.phone, "+1 555-0199"),
        website: domain ? `https://${domain}` : (rawWeb.startsWith("http") ? rawWeb : `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`),
        address: safeStr(lead.address, loc),
        city: cleanCity || "Location",
        country: cleanCountry || "",
        niche: cleanNiche,
        source: sourceName,
        socials: {
          linkedin: lead.linkedin || (domain ? `https://linkedin.com/company/${domain.split('.')[0]}` : null)
        }
      });
    };

    // ── TIER 1: LinkedIn X-Ray ──
    if (process.env.SERPER_API_KEY) {
      try {
        const res = await fetch("https://google.serper.dev/search", {
          method: "POST",
          headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ 
            q: `site:linkedin.com/company "${cleanNiche}" "${cleanCity}"`, 
            num: targetLimit,
            page: randomPage
          }),
        });
        const data = await res.json();
        (data.organic || []).forEach((item: any) => {
          const compName = safeStr(item.title).split(":")[0].split("|")[0].split("-")[0].trim();
          addLead({ name: compName, website: item.link, linkedin: item.link }, "LinkedIn Corporate X-Ray");
        });
      } catch (e) {}
    }

    // ── TIER 2: Google Places ──
    if (combinedLeads.length < targetLimit && process.env.SERPER_API_KEY) {
      try {
        const res = await fetch("https://google.serper.dev/places", {
          method: "POST",
          headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ q: searchQuery, num: targetLimit }),
        });
        const data = await res.json();
        (data.places || []).forEach((p: any) => addLead(p, "Google Places Live"));
      } catch (e) {}
    }

    // ── TIER 3: Gemini AI Business Index ──
    if (combinedLeads.length < targetLimit && process.env.GEMINI_API_KEY) {
      try {
        const needed = targetLimit - combinedLeads.length;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Return ${needed} REAL companies for ${cleanNiche} in ${loc}. JSON format: [{"name":"Name","website":"https://domain.com","address":"Address"}]` }] }]
          }),
        });
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        const parsed = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
        if (Array.isArray(parsed)) parsed.forEach((item: any) => addLead(item, "AI Business Index"));
      } catch (e) {}
    }

    return NextResponse.json({ success: true, leads: combinedLeads.slice(0, targetLimit), count: combinedLeads.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}