export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";


function clean(s: any) {
  return String(s ?? "").trim();
}

export async function POST(req: NextRequest) {
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
    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 401 });

    const body = await req.json();
    const leadIds: string[] = Array.isArray(body.leadIds) ? body.leadIds : [];
    const subjectTemplate = clean(body.subject);
    const bodyTemplate = clean(body.body);

    if (!subjectTemplate || !bodyTemplate) {
      return NextResponse.json({ error: "Subject and Body templates are required" }, { status: 400 });
    }

    // Fetch target leads from DB
    const whereClause: any = { userId };
    if (leadIds.length > 0) {
      whereClause.id = { in: leadIds };
    } else {
      whereClause.status = "NEW"; // Default: send to all NEW leads
    }

    const targetLeads = await prisma.lead.findMany({
      where: whereClause,
      take: 50, // Safety cap per batch
    });

    if (targetLeads.length === 0) {
      return NextResponse.json({ error: "No target leads found for campaign outreach" }, { status: 400 });
    }

    const gmailUser = clean(process.env.GMAIL_USER);
    const gmailPass = clean(process.env.GMAIL_PASS);
    const fromEmail = clean(process.env.EMAIL_FROM) || gmailUser || "noreply@nexflow.local";
    const fromName = clean(process.env.EMAIL_FROM_NAME) || "NexFlow Outreach";
    const from = `${fromName} <${fromEmail}>`;
    const simulate =
      clean(process.env.EMAIL_SIMULATE).toLowerCase() === "true" ||
      clean(process.env.EMAIL_SIMULATE) === "1" ||
      !gmailPass;

    let sentCount = 0;
    let failedCount = 0;
    const logs: any[] = [];

    for (const lead of targetLeads) {
      const toEmail = clean(lead.email);
      if (!toEmail) {
        failedCount++;
        continue;
      }

      const name = lead.name || "there";
      const company = lead.company || lead.name || "your business";
      const website = lead.website || "";

      // Dynamic Personalization
      const personalizedSubject = subjectTemplate
        .replace(/\{\{name\}\}/gi, name)
        .replace(/\{\{company\}\}/gi, company)
        .replace(/\{\{website\}\}/gi, website);

      const personalizedBody = bodyTemplate
        .replace(/\{\{name\}\}/gi, name)
        .replace(/\{\{company\}\}/gi, company)
        .replace(/\{\{website\}\}/gi, website);

      let dispatched = false;
      let via = "simulate";

      if (gmailUser && gmailPass && !simulate) {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: gmailUser, pass: gmailPass },
          });
          await transporter.sendMail({
            from,
            to: toEmail,
            subject: personalizedSubject,
            text: personalizedBody,
          });
          dispatched = true;
          via = "gmail";
        } catch (err: any) {
          console.error(`Failed to send to ${toEmail}:`, err);
        }
      } else {
        dispatched = true;
        via = "simulate";
      }

      if (dispatched) {
        sentCount++;
        // Record in DB
        try {
          await prisma.emailSent.create({
            data: {
              userId,
              leadId: lead.id,
              subject: personalizedSubject,
              body: personalizedBody,
              status: "SENT",
              recipient: toEmail,
              sentAt: new Date(),
            } as any,
          });

          await prisma.lead.update({
            where: { id: lead.id },
            data: { status: "CONTACTED" as any },
          });

          await prisma.activity.create({
            data: {
              userId,
              leadId: lead.id,
              type: "EMAIL_SENT" as any,
              message: `Campaign email sent to ${toEmail} (${via})`,
            } as any,
          });
        } catch {}

        logs.push({ lead: lead.name, email: toEmail, status: "SENT", via });
      } else {
        failedCount++;
        logs.push({ lead: lead.name, email: toEmail, status: "FAILED" });
      }
    }

    return NextResponse.json({
      success: true,
      total: targetLeads.length,
      sent: sentCount,
      failed: failedCount,
      simulated: simulate,
      logs,
      message: `Batch campaign executed: ${sentCount} emails dispatched successfully!`,
    });
  } catch (error: any) {
    console.error("BULK SEND ERROR:", error);
    return NextResponse.json({ error: error.message || "Bulk send failed" }, { status: 500 });
  }
}