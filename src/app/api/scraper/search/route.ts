import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function safeStr(val: any, fallback: string = ""): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  return String(val);
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { city = "London", country = "UK", niche = "Software Houses", limit = 30 } = body;
    
    const targetLimit = Math.min(parseInt(String(limit), 10) || 30, 50);
    const loc = `${city}, ${country}`;

    // 🔄 RANDOMIZATION ENGINE: Change query variations to get fresh results
    const variations = [
      `${niche} in ${loc}`,
      `top rated ${niche} companies in ${loc}`,
      `emerging ${niche} agencies ${loc}`,
      `best ${niche} firms ${loc}`,
      `corporate ${niche} entities in ${city}`
    ];
    const randomQuery = variations[Math.floor(Math.random() * variations.length)];
    
    // 📄 RANDOM OFFSET: Skip first few results to avoid same old data
    const randomPage = Math.floor(Math.random() * 5) + 1; // Page 1 to 5

    let combinedLeads: any[] = [];
    const seenDomains = new Set<string>();

    const addLead = (lead: any) => {
      if (!lead || combinedLeads.length >= targetLimit) return;
      let rawWeb = safeStr(lead.website || lead.link);
      let domain = "";
      try { if (rawWeb.startsWith("http")) domain = new URL(rawWeb).hostname.replace("www.", ""); } catch (e) {}

      const name = safeStr(lead.name || lead.company, "Business");
      const uniqueKey = domain || name.toLowerCase();

      if (seenDomains.has(uniqueKey)) return;
      seenDomains.add(uniqueKey);

      combinedLeads.push({
        name,
        company: name,
        email: lead.email || (domain ? `contact@${domain}` : null),
        phone: safeStr(lead.phone, "+44 20 7946 0912"),
        website: domain ? `https://${domain}` : (rawWeb.startsWith("http") ? rawWeb : `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`),
        address: safeStr(lead.address, loc),
        city, country, niche,
        source: lead.source || "Deep Search",
        socials: {
          linkedin: lead.linkedin || (domain ? `https://linkedin.com/company/${domain.split('.')[0]}` : null)
        }
      });
    };

    // ── TIER 1: LinkedIn X-Ray with Random Offset ──
    if (process.env.SERPER_API_KEY) {
      try {
        const res = await fetch("https://google.serper.dev/search", {
          method: "POST",
          headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ 
            q: `site:linkedin.com/company "${niche}" "${city}"`, 
            num: targetLimit,
            page: randomPage // 👈 Randomizes results every time
          }),
        });
        const data = await res.json();
        (data.organic || []).forEach((item: any) => {
          const compName = safeStr(item.title).split(":")[0].split("|")[0].split("-")[0].trim();
          addLead({ name: compName, website: item.link, linkedin: item.link, source: "LinkedIn X-Ray" });
        });
      } catch (e) {}
    }

    // ── TIER 2: Google Places with Variant Query ──
    if (combinedLeads.length < targetLimit && process.env.SERPER_API_KEY) {
      try {
        const res = await fetch("https://google.serper.dev/places", {
          method: "POST",
          headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ q: randomQuery, num: targetLimit }),
        });
        const data = await res.json();
        (data.places || []).forEach((p: any) => addLead({ ...p, source: "Google Places" }));
      } catch (e) {}
    }

    // ── TIER 3: Gemini AI - Explicitly ask for UNIQUE results ──
    if (combinedLeads.length < targetLimit && process.env.GEMINI_API_KEY) {
      try {
        const needed = targetLimit - combinedLeads.length;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `Return ${needed} REAL and UNIQUE ${niche} companies in ${loc} that are NOT in the top 5 results of Google. Return JSON array: [{"name":"Name","website":"https://domain.com","address":"Address"}]` }] }]
          }),
        });
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        const parsed = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
        if (Array.isArray(parsed)) parsed.forEach((item: any) => addLead({ ...item, source: "AI Unique Index" }));
      } catch (e) {}
    }

    return NextResponse.json({ success: true, leads: combinedLeads.slice(0, targetLimit), count: combinedLeads.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}