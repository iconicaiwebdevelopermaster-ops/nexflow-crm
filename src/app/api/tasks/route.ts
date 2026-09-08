export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { lead: true },
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { title, leadId, dueDate } = await req.json();

    if (!title) {
      return NextResponse.json({ success: false, error: "Task title is required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        userId: session.user.id,
        leadId: leadId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: { lead: true },
    });

    return NextResponse.json({ success: true, data: task, message: "Task created successfully" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}