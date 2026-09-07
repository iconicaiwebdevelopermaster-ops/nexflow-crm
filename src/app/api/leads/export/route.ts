import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function esc(v: any) {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

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

    const leads = await prisma.lead.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const headers = ["Name","Email","Phone","Company","Website","Status","Source","Notes","Created At"];
    const lines = [headers.join(",")];
    for (const l of leads) {
      lines.push([
        esc(l.name),
        esc(l.email),
        esc(l.phone),
        esc(l.company),
        esc(l.website),
        esc(l.status),
        esc(l.source),
        esc((l as any).notes),
        esc(l.createdAt?.toISOString?.() || l.createdAt),
      ].join(","));
    }

    const csv = "\uFEFF" + lines.join("\r\n");
    const date = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="nexflow-leads-${date}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.error("EXPORT ERROR:", error);
    return NextResponse.json({ error: error.message || "Export failed" }, { status: 500 });
  }
}