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
    const { query, city, country, niche, limit = 30, channel = "linkedin" } = body;
    
    const cleanNiche = safeStr(niche || query);
    const cleanCity = safeStr(city);
    const cleanCountry = safeStr(country);

    if (!cleanNiche) {
      return NextResponse.json({ error: "Please enter a Target Niche / Industry." }, { status: 400 });
    }
    if (!cleanCity && !cleanCountry) {
      return NextResponse.json({ error: "Please specify a City or Country." }, { status: 400 });
    }

    const targetLimit = Math.min(parseInt(String(limit), 10) || 30, 50);
    const loc = [cleanCity, cleanCountry].filter(Boolean).join(", ");
    const searchQuery = `${cleanNiche} in ${loc}`;

    let combinedLeads: any[] = [];
    const seenDomains = new Set<string>();

    const addLead = (lead: any, defaultSource: string) => {
      if (!lead || combinedLeads.length >= targetLimit) return;
      let rawWeb = safeStr(lead.website || lead.link);
      let domain = "";
      try { if (rawWeb.startsWith("http")) domain = new URL(rawWeb).hostname.replace("www.", ""); } catch (e) {}

      const name = safeStr(lead.name || lead.company, cleanNiche);
      const uniqueKey = domain || name.toLowerCase();

      if (seenDomains.has(uniqueKey)) return;
      seenDomains.add(uniqueKey);

      let linkedinUrl = safeStr(lead.linkedin);
      if (!linkedinUrl && domain) {
        linkedinUrl = `https://www.linkedin.com/company/${domain.split('.')[0]}`;
      }

      combinedLeads.push({
        name,
        company: name,
        email: lead.email || (domain ? `contact@${domain}` : `info@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`),
        phone: safeStr(lead.phone || lead.phoneNumber, "+1 555-0199"),
        website: domain ? `https://${domain}` : (rawWeb.startsWith("http") ? rawWeb : `https://www.${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`),
        address: safeStr(lead.address, loc),
        city: cleanCity || "Location",
        country: cleanCountry || "",
        niche: cleanNiche,
        source: defaultSource,
        socials: {
          linkedin: linkedinUrl,
          facebook: domain ? `https://facebook.com/${domain.split('.')[0]}` : null
        }
      });
    };

    // CHANNEL 1: LINKEDIN B2B X-RAY
    if (channel === "linkedin" && process.env.SERPER_API_KEY) {
      try {
        const res = await fetch("https://google.serper.dev/search", {
          method: "POST",
          headers: { "X-API-KEY": process.env.SERPER_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ q: `site:linkedin.com/company "${cleanNiche}" "${cleanCity}"`, num: targetLimit }),
        });
        const data = await res.json();
        (data.organic || []).forEach((item: any) => {
          const compName = safeStr(item.title).split(":")[0].split("|")[0].split("-")[0].trim();
          if (compName && compName.length > 2) {
            addLead({ name: compName, website: item.link, linkedin: item.link }, "LinkedIn B2B X-Ray");
          }
        });
      } catch (e) {}
    }

    // CHANNEL 2: GOOGLE PLACES LIVE
    if ((channel === "google" || combinedLeads.length < targetLimit) && process.env.SERPER_API_KEY) {
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

    // CHANNEL 3: WEB CORPORATE HARVESTER & AI INDEX
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
        if (Array.isArray(parsed)) parsed.forEach((item: any) => addLead(item, "Web Corporate Index"));
      } catch (e) {}
    }

    return NextResponse.json({ success: true, leads: combinedLeads.slice(0, targetLimit), count: combinedLeads.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}