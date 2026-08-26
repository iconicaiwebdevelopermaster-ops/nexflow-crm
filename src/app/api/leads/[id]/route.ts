import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LeadStatus } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const lead = await prisma.lead.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: {
        activities: { orderBy: { createdAt: "desc" } },
        emailsSent: { orderBy: { sentAt: "desc" } },
        tasks: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: lead });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const existing = await prisma.lead.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
    }

    let activityCreate = undefined;
    if (body.status && body.status !== existing.status) {
      activityCreate = {
        create: {
          type: "STATUS_CHANGED" as const,
          description: `Status changed from ${existing.status} to ${body.status}`,
        },
      };
    }

    const updatePayload: any = { ...body };
    if (body.status) {
      updatePayload.status = body.status as LeadStatus;
    }
    if (activityCreate) {
      updatePayload.activities = activityCreate;
    }

    const updated = await prisma.lead.update({
      where: { id: params.id },
      data: updatePayload,
    });

    return NextResponse.json({ success: true, data: updated, message: "Lead updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await prisma.lead.deleteMany({
      where: { id: params.id, userId: session.user.id },
    });

    return NextResponse.json({ success: true, message: "Lead deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}