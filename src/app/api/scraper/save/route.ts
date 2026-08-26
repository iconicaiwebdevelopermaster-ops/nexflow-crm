// src/app/api/scraper/save/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "nexflow-secret-key-12345" 
    });

    let userId = token?.id || token?.sub || (token?.user as any)?.id;

    if (!userId) {
      const firstUser = await db.users.findFirst();
      if (firstUser) {
        userId = firstUser.id;
      } else {
        return NextResponse.json({ error: "No user account found to associate leads." }, { status: 400 });
      }
    }

    const body = await req.json();
    const leadsToSave = Array.isArray(body) ? body : [body];

    if (leadsToSave.length === 0) {
      return NextResponse.json({ error: "No lead payload provided!" }, { status: 400 });
    }

    const savedCount = [];
    const skippedCount = [];

    for (const item of leadsToSave) {
      const emailAddress = item.emails && item.emails.length > 0 
        ? item.emails[0] 
        : `contact@${(item.website || "example.com").replace(/https?:\/\/(www\.)?/, "").replace(/\/$/, "")}`;

      const existingLead = await db.leads.findFirst({
        where: {
          email: emailAddress,
          user_id: userId
        }
      });

      if (existingLead) {
        skippedCount.push(item.name);
        continue;
      }

      const cleanLead = await db.leads.create({
        data: {
          name: item.name || "Unknown Company",
          email: emailAddress,
          phone: item.phone || "",
          company: item.name || "N/A",
          website: item.website || "",
          status: "NEW",
          source: item.source || "NexScraper Engine",
          notes: `System Scraped Snippet: ${item.snippet || "No notes."} | Instagram: ${item.instagram || "N/A"} | LinkedIn: ${item.linkedin || "N/A"}`,
          user_id: userId
        }
      });

      await db.activities.create({
        data: {
          lead_id: cleanLead.id,
          type: "NOTE_ADDED",
          description: `Lead auto-scraped and imported successfully from NexScraper (${item.source})`
        }
      });

      savedCount.push(cleanLead.name);
    }

    return NextResponse.json({
      success: true,
      message: `Completed processing! Saved: ${savedCount.length}, Duplicates skipped: ${skippedCount.length}`,
      saved: savedCount,
      skipped: skippedCount
    });

  } catch (error: any) {
    console.error("Scraper Save Controller Error:", error);
    return NextResponse.json({ error: error.message || "Failed to import scraped lead records." }, { status: 500 });
  }
}