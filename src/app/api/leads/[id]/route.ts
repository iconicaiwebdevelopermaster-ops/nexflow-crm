export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";


const ALLOWED = new Set(["NEW", "CONTACTED", "REPLIED", "WON", "LOST"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const id = params.id;
    const body = await req.json();
    let status = String(body.status || "").toUpperCase().trim();

    // map UI aliases -> schema enum
    if (status === "DISCUSSION" || status === "QUALIFIED") status = "REPLIED";

    if (!ALLOWED.has(status)) {
      return NextResponse.json(
        { error: `Invalid status. Use: ${Array.from(ALLOWED).join(", ")}` },
        { status: 400 }
      );
    }

    const existing = await prisma.lead.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: { status: status as any },
    });

    try {
      await prisma.activity.create({
        data: {
          userId,
          leadId: id,
          type: "STATUS_CHANGED" as any,
          message: `Pipeline: ${existing.status} → ${status}`,
        } as any,
      });
    } catch {}

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error("LEAD PATCH ERROR:", error);
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({
      req: _req,
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

    const id = params.id;
    const existingLead = await prisma.lead.findFirst({ where: { id, userId } });
    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("LEAD DELETE ERROR:", error);
    return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });
  }
}