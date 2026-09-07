import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function pick(obj: any, keys: string[]) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function domainFromWebsite(website: string) {
  try {
    const u = new URL(website.startsWith("http") ? website : `https://${website}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    });

    if (!token?.sub && !token?.email) {
      return NextResponse.json({ error: "Unauthorized. Please login again." }, { status: 401 });
    }

    let userId = (token as any).sub as string | undefined;
    if (!userId && token.email) {
      const u = await prisma.user.findFirst({
        where: { email: String(token.email) },
        select: { id: true },
      });
      userId = u?.id;
    }
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const body = await req.json();
    const list = Array.isArray(body)
      ? body
      : Array.isArray(body?.leads)
      ? body.leads
      : body
      ? [body]
      : [];

    if (!list.length) {
      return NextResponse.json({ error: "No leads provided" }, { status: 400 });
    }

    let saved = 0;
    let skipped = 0;
    const created: any[] = [];
    let lastError = "";

    for (const raw of list) {
      const name = pick(raw, ["name", "title", "company"]) || "Unknown Lead";
      const company = pick(raw, ["company", "name", "title"]) || name;
      const website = pick(raw, ["website", "link", "url"]);
      const phone = pick(raw, ["phone", "phoneNumber"]) || null;
      const source = pick(raw, ["source"]) || "NexScraper";
      const location = pick(raw, ["location", "address", "city"]);
      const snippet = pick(raw, ["snippet", "notes"]);
      const linkedin = pick(raw, ["linkedin"]);
      const instagram = pick(raw, ["instagram"]);
      const facebook = pick(raw, ["facebook"]);

      // email REQUIRED in schema
      let email = pick(raw, ["email"]).toLowerCase();
      if (!email) {
        const emails = raw.emails;
        if (Array.isArray(emails) && emails[0]) email = String(emails[0]).toLowerCase();
      }
      if (!email && website) {
        const d = domainFromWebsite(website);
        if (d) email = `info@${d}`;
      }
      if (!email) {
        // last resort so Prisma required field never fails
        email = `lead_${Date.now()}_${saved + skipped}@no-email.local`;
      }

      const notes = [
        snippet,
        location ? `Location: ${location}` : "",
        linkedin ? `LinkedIn: ${linkedin}` : "",
        instagram ? `Instagram: ${instagram}` : "",
        facebook ? `Facebook: ${facebook}` : "",
      ]
        .filter(Boolean)
        .join(" | ") || null;

      // duplicate check
      try {
        const exists = await prisma.lead.findFirst({
          where: { userId, email },
          select: { id: true },
        });
        if (exists) {
          skipped++;
          continue;
        }
      } catch {}

      try {
        const lead = await prisma.lead.create({
          data: {
            userId,
            name,
            email, // required
            phone: phone || null,
            company: company || null,
            website: website || null,
            status: "NEW",
            source,
            notes,
          },
        });
        created.push(lead);
        saved++;

        try {
          await prisma.activity.create({
            data: {
              userId,
              leadId: lead.id,
              type: "LEAD_CREATED",
              message: `Imported via ${source}: ${name}`,
            },
          });
        } catch {}
      } catch (e: any) {
        skipped++;
        lastError = e?.message || String(e);
        console.error("Lead create failed", e);
      }
    }

    return NextResponse.json({
      success: saved > 0,
      saved,
      skipped,
      count: saved,
      message:
        saved > 0
          ? `Imported ${saved} leads${skipped ? `, skipped ${skipped}` : ""}! Open Leads page.`
          : `Import failed: ${lastError || "nothing saved"}`,
      error: saved > 0 ? undefined : lastError,
      leads: created,
    });
  } catch (error: any) {
    console.error("BULK IMPORT ERROR:", error);
    return NextResponse.json({ error: error.message || "Bulk import failed" }, { status: 500 });
  }
}
