import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getGmailClientForUser } from '@/lib/gmail-client';
import nodemailer from 'nodemailer';
import { LeadStatus, EmailStatus, ActivityType } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 });
    }

    // Lookup user safely by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 401 });
    }

    const body = await req.json();
    const { leadIds, subject, body: emailBody, templateId } = body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'No leads selected for bulk dispatch.' }, { status: 400 });
    }

    if (!subject || !emailBody) {
      return NextResponse.json({ error: 'Subject and email body are required.' }, { status: 400 });
    }

    // Fetch target leads owned by this user
    const leads = await prisma.lead.findMany({
      where: {
        id: { in: leadIds },
        userId: user.id,
      },
    });

    if (leads.length === 0) {
      return NextResponse.json({ error: 'No valid leads found to send.' }, { status: 404 });
    }

    // Check Sending Channel: Gmail OAuth vs Manual SMTP
    const gmailAccount = await prisma.gmailAccount.findFirst({
      where: { userId: user.id, isActive: true },
    });

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    if (gmailAccount) {
      // MODE 1: GMAIL OAUTH BULK DISPATCH
      const gmail = await getGmailClientForUser(user.id);

      for (const lead of leads) {
        try {
          if (gmailAccount.sentToday + successCount >= gmailAccount.dailyQuota) {
            errors.push('Daily quota reached during dispatch.');
            break;
          }

          const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
          const messageParts = [
            `From: ${gmailAccount.email}`,
            `To: ${lead.email}`,
            `Subject: ${utf8Subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            'Content-Transfer-Encoding: 7bit',
            '',
            emailBody.replace(/\n/g, '<br/>'),
          ];

          const rawMessage = Buffer.from(messageParts.join('\r\n'))
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

          const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: rawMessage },
          });

          // Log in Neon DB
          await prisma.$transaction([
            prisma.emailSent.create({
              data: {
                userId: user.id,
                leadId: lead.id,
                templateId: templateId || null,
                subject,
                body: emailBody,
                gmailMessageId: res.data.id || '',
                gmailThreadId: res.data.threadId || '',
                deliveryStatus: 'sent',
                status: EmailStatus.SENT,
              },
            }),
            prisma.lead.update({
              where: { id: lead.id },
              data: { status: LeadStatus.SENT },
            }),
            prisma.activity.create({
              data: {
                leadId: lead.id,
                type: ActivityType.EMAIL_SENT,
                description: `Bulk Cold Email sent via Gmail OAuth: "${subject}"`,
              },
            }),
          ]);

          successCount++;
        } catch (err: any) {
          failedCount++;
          console.error(`Failed to send to ${lead.email}:`, err.message);
        }
      }

      // Increment daily quota count
      if (successCount > 0) {
        await prisma.gmailAccount.update({
          where: { id: gmailAccount.id },
          data: { sentToday: { increment: successCount } },
        });
      }

    } else if (user.smtpUser && user.smtpPass) {
      // MODE 2: MANUAL SMTP BULK DISPATCH
      const transporter = nodemailer.createTransport({
        host: user.smtpHost || 'smtp.gmail.com',
        port: user.smtpPort || 587,
        secure: user.smtpPort === 465,
        auth: {
          user: user.smtpUser,
          pass: user.smtpPass,
        },
      });

      for (const lead of leads) {
        try {
          const info = await transporter.sendMail({
            from: `"${user.name || 'NexFlow Outreach'}" <${user.smtpUser}>`,
            to: lead.email,
            subject,
            html: emailBody.replace(/\n/g, '<br/>'),
          });

          await prisma.$transaction([
            prisma.emailSent.create({
              data: {
                userId: user.id,
                leadId: lead.id,
                templateId: templateId || null,
                subject,
                body: emailBody,
                gmailMessageId: info.messageId || '',
                deliveryStatus: 'sent',
                status: EmailStatus.SENT,
              },
            }),
            prisma.lead.update({
              where: { id: lead.id },
              data: { status: LeadStatus.SENT },
            }),
            prisma.activity.create({
              data: {
                leadId: lead.id,
                type: ActivityType.EMAIL_SENT,
                description: `Bulk Cold Email sent via Manual SMTP: "${subject}"`,
              },
            }),
          ]);

          successCount++;
        } catch (err: any) {
          failedCount++;
          console.error(`SMTP Bulk send error for ${lead.email}:`, err.message);
        }
      }
    } else {
      return NextResponse.json(
        { error: 'No active sending channel. Please connect Gmail OAuth or save Manual SMTP credentials in Settings.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Bulk dispatch completed: ${successCount} sent, ${failedCount} failed.`,
      sentCount: successCount,
      failedCount,
      errors,
    });

  } catch (error: any) {
    console.error('Bulk Email Route Error:', error);
    return NextResponse.json({ error: error?.message || 'Bulk sending failed.' }, { status: 500 });
  }
}