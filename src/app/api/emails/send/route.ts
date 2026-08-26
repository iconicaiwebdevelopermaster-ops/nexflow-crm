import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendOutreachEmail } from "@/lib/email";
import { EmailStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { leadId, templateId, subject, body } = await req.json();

    if (!leadId || !subject || !body) {
      return NextResponse.json({ success: false, error: "Lead, subject, and body are required." }, { status: 400 });
    }

    const [user, lead] = await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id } }),
      prisma.lead.findFirst({ where: { id: leadId, userId: session.user.id } }),
    ]);

    if (!user || !lead) {
      return NextResponse.json({ success: false, error: "Lead or User not found." }, { status: 404 });
    }

    let emailStatus: EmailStatus = "SENT";
    try {
      await sendOutreachEmail({
        to: lead.email,
        subject,
        body,
        userSmtp: {
          host: user.smtpHost,
          port: user.smtpPort,
          user: user.smtpUser,
          pass: user.smtpPass,
        },
      });
    } catch (err: any) {
      console.error("Email send failed:", err.message);
      emailStatus = "FAILED";
    }

    const sentRecord = await prisma.emailSent.create({
      data: {
        userId: session.user.id,
        leadId: lead.id,
        templateId: templateId || null,
        subject,
        body,
        status: emailStatus,
      },
    });

    if (emailStatus === "SENT") {
      if (lead.status === "NEW") {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: "CONTACTED" },
        });
      }

      await prisma.activity.create({
        data: {
          leadId: lead.id,
          type: "EMAIL_SENT",
          description: `Sent cold outreach email: "${subject}"`,
        },
      });

      return NextResponse.json({
        success: true,
        data: sentRecord,
        message: "Email sent successfully!",
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Failed to dispatch email. Check your SMTP settings.",
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}