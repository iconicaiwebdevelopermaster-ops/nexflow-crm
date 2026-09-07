import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    });

    if (!token?.sub && !token?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // EmailSent schema uses sentAt (NOT createdAt)
    let emails: any[] = [];
    try {
      emails = await prisma.emailSent.findMany({
        where: { userId },
        include: {
          lead: {
            select: { id: true, name: true, email: true, company: true },
          },
        },
        orderBy: { sentAt: "desc" },
        take: 200,
      });
    } catch {
      // fallback if sentAt missing on some DBs
      try {
        emails = await prisma.emailSent.findMany({
          where: { userId },
          include: {
            lead: {
              select: { id: true, name: true, email: true, company: true },
            },
          },
          orderBy: { id: "desc" },
          take: 200,
        });
      } catch (e2: any) {
        // last fallback: no include / no order
        emails = await prisma.emailSent.findMany({
          where: { userId },
          take: 200,
        });
      }
    }

    const normalized = (emails || []).map((e: any) => {
      // recipient may be inside body as "To: ..."
      let toEmail = e.recipient || e.to || e.email || e.toEmail || "";
      if (!toEmail && typeof e.body === "string") {
        const m = e.body.match(/^To:\s*(.+)$/m);
        if (m) toEmail = m[1].trim();
      }
      if (!toEmail && e.lead?.email) toEmail = e.lead.email;

      return {
        id: e.id,
        subject: e.subject || "(No subject)",
        body: e.body || "",
        toEmail,
        status: e.status || "SENT",
        createdAt: e.sentAt || e.createdAt || null,
        sentAt: e.sentAt || e.createdAt || null,
        lead: e.lead || null,
      };
    });

    return NextResponse.json({
      success: true,
      emails: normalized,
      data: normalized,
      count: normalized.length,
    });
  } catch (error: any) {
    console.error("EMAILS GET ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load email history" },
      { status: 500 }
    );
  }
}
