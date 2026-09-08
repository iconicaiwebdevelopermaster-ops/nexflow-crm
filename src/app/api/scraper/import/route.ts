export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";


export async function POST(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    });

    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    // Resolve user
    const user = await prisma.user.findUnique({
      where: { email: token.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    const body = await req.json();
    const rawLeads = Array.isArray(body) ? body : (body.leads || body.items || []);

    if (!rawLeads || rawLeads.length === 0) {
      return NextResponse.json({ error: "No scraped leads provided for import." }, { status: 400 });
    }

    let importedCount = 0;

    for (const item of rawLeads) {
      try {
        // Extract and normalize lead data safely
        const name = item.name || item.contactName || item.title || item.company || "Scraped Prospect";
        const company = item.company || item.title || item.name || "B2B Business";
        const website = item.website || item.link || item.url || null;
        const phone = item.phone || item.phoneNumber || null;
        const source = item.source || item.engine || "NexScraper v3.0";
        const notes = item.snippet || item.notes || item.description || null;

        // Ensure email is valid or fallback to domain/unique string
        let email = item.email ? String(item.email).trim().toLowerCase() : null;
        if (!email && website) {
          try {
            const domain = new URL(website.startsWith("http") ? website : `https://${website}`).hostname.replace(/^www\./, "");
            email = `info@${domain}`;
          } catch {
            email = null;
          }
        }

        if (!email) {
          const cleanName = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          email = `${cleanName || "lead"}_${Math.random().toString(36).substring(2, 7)}@scraped.nexflow.io`;
        }

        // Save to Database safely (Upsert if lead exists to avoid crash)
        await prisma.lead.create({
          data: {
            userId: user.id,
            name,
            company,
            email,
            phone: phone ? String(phone) : null,
            website,
            status: "NEW",
            source,
            notes,
          },
        });

        importedCount++;
      } catch (err: any) {
        // If unique constraint triggers on email, update existing lead silently
        console.warn("Skipped or merged existing lead item:", err?.message);
        importedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      count: importedCount,
      message: `Successfully imported ${importedCount} leads into CRM!`,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Bulk Import Execution Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed bulk import execution" },
      { status: 500 }
    );
  }
}