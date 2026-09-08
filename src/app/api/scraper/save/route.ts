export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getToken } from "next-auth/jwt";


export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET });
    const body = await req.json();
    const { leads } = body;

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: "No leads provided to save" },
        { status: 400 }
      );
    }

    let savedCount = 0;
    const errors: string[] = [];

    for (const lead of leads) {
      try {
        const email = lead.email?.trim() || "";
        const company = lead.company || lead.businessName || lead.title || "Unknown Business";
        const name = lead.name || lead.contactName || "Decision Maker";
        const phone = lead.phone || "";
        const website = lead.website || lead.url || "";
        const city = lead.city || lead.location || "";
        const niche = lead.niche || lead.category || lead.industry || "";
        const source = lead.source || "SCRAPER";

        if (!email && !company) continue;

        // Upsert or Create lead
        if (email) {
          await db.lead.upsert({
            where: { email },
            update: {
              company,
              phone: phone || undefined,
              website: website || undefined,
              city: city || undefined,
              niche: niche || undefined,
            },
            create: {
              name,
              email,
              company,
              phone,
              website,
              city,
              niche,
              source,
              status: "NEW",
              userId: token?.sub || null,
            },
          });
        } else {
          await db.lead.create({
            data: {
              name,
              email: `no-email-${Date.now()}-${Math.random().toString(36).substring(7)}@nexflow.local`,
              company,
              phone,
              website,
              city,
              niche,
              source,
              status: "NEW",
              userId: token?.sub || null,
            },
          });
        }
        savedCount++;
      } catch (err: any) {
        errors.push(err.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${savedCount} leads`,
      savedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error in /api/scraper/save:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save scraped leads" },
      { status: 500 }
    );
  }
}
