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
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Live counts parallel
    const [totalLeads, totalEmailsSent, leadsByStatus, recentLeads, recentEmails] =
      await Promise.all([
        prisma.lead.count({ where: { userId } }),
        prisma.emailSent.count({ where: { userId } }),
        prisma.lead.groupBy({
          by: ["status"],
          where: { userId },
          _count: { status: true },
        }),
        prisma.lead.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, name: true, company: true, email: true, status: true, source: true, createdAt: true },
        }),
        prisma.emailSent.findMany({
          where: { userId },
          orderBy: { sentAt: "desc" },
          take: 5,
          include: { lead: { select: { name: true, company: true } } },
        }),
      ]);

    const statusMap: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      REPLIED: 0,
      WON: 0,
      LOST: 0,
    };

    leadsByStatus.forEach((item) => {
      const st = String(item.status || "NEW").toUpperCase();
      statusMap[st] = (statusMap[st] || 0) + item._count.status;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalLeads,
        totalEmailsSent,
        newLeads: statusMap.NEW || 0,
        contacted: statusMap.CONTACTED || 0,
        replied: statusMap.REPLIED || 0,
        won: statusMap.WON || 0,
        lost: statusMap.LOST || 0,
      },
      recentLeads,
      recentEmails: recentEmails.map((e) => ({
        id: e.id,
        subject: e.subject || "(No subject)",
        recipient: (e as any).recipient || (e as any).to || (e as any).toEmail || e.lead?.name || "Recipient",
        status: e.status || "SENT",
        sentAt: e.sentAt,
      })),
    });
  } catch (error: any) {
    console.error("DASHBOARD STATS ERROR:", error);
    return NextResponse.json({ error: error.message || "Failed to load stats" }, { status: 500 });
  }
}