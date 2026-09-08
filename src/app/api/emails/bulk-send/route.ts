import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getGmailClientForUser } from '@/lib/gmail-client';
import nodemailer from 'nodemailer';
import { LeadStatus, EmailStatus, ActivityType } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function extractLeadIds(body: any): string[] {
  const raw =
    body?.leadIds ??
    body?.ids ??
    body?.selectedIds ??
    body?.selectedLeadIds ??
    body?.leads ??
    body?.leadId ??
    [];

  if (Array.isArray(raw)) {
    return raw
      .map((x) => (typeof x === 'string' ? x : x?.id))
      .filter((x): x is string => typeof x === 'string' && x.length > 0);
  }

  if (typeof raw === 'string' && raw.length > 0) {
    return [raw];
  }

  return [];
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const leadIds = extractLeadIds(body);
    const subject = body?.subject || body?.emailSubject || '';
    const emailBody = body?.body || body?.emailBody || body?.message || body?.content || '';
    const templateId = body?.templateId || null;

    if (leadIds.length === 0) {
      return NextResponse.json(
        {
          error: 'No lead IDs provided.',
          hint: 'Send leadIds (array) in JSON body. Also accepts: ids, selectedIds, selectedLeadIds, leads.',
          receivedKeys: Object.keys(body || {}),
        },
        { status: 400 }
      );
    }

    if (!subject || !emailBody) {
      return NextResponse.json(
        {
          error: 'Subject and email body are required.',
          receivedKeys: Object.keys(body || {}),
        },
        { status: 400 }
      );
    }

    const leads = await prisma.lead.findMany({
      where: {
        id: { in: leadIds },
        userId: user.id,
      },
    });

    if (leads.length === 0) {
      return NextResponse.json(
        { error: 'No valid leads found for your account with those IDs.' },
        { status: 404 }
      );
    }

    const gmailAccount = await prisma.gmailAccount.findFirst({
      where: { userId: user.id, isActive: true },
    });

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    if (gmailAccount) {
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
            String(emailBody).replace(/\n/g, '<br/>'),
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

          await prisma.$transaction([
            prisma.emailSent.create({
              data: {
                userId: user.id,
                leadId: lead.id,
                templateId,
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
                description: `Bulk email via Gmail OAuth: "${subject}"`,
              },
            }),
          ]);

          successCount++;
        } catch (err: any) {
          failedCount++;
          errors.push(`${lead.email}: ${err.message}`);
        }
      }

      if (successCount > 0) {
        await prisma.gmailAccount.update({
          where: { id: gmailAccount.id },
          data: { sentToday: { increment: successCount } },
        });
      }
    } else if (user.smtpUser && user.smtpPass) {
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
            html: String(emailBody).replace(/\n/g, '<br/>'),
          });

          await prisma.$transaction([
            prisma.emailSent.create({
              data: {
                userId: user.id,
                leadId: lead.id,
                templateId,
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
                description: `Bulk email via SMTP: "${subject}"`,
              },
            }),
          ]);

          successCount++;
        } catch (err: any) {
          failedCount++;
          errors.push(`${lead.email}: ${err.message}`);
        }
      }
    } else {
      return NextResponse.json(
        {
          error:
            'No active sending channel. Connect Gmail OAuth or save Manual SMTP in Settings first.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Bulk dispatch completed: ${successCount} sent, ${failedCount} failed.`,
      sentCount: successCount,
      failedCount,
      processedLeadIds: leads.map((l) => l.id),
      errors,
    });
  } catch (error: any) {
    console.error('Bulk Email Route Error:', error);
    return NextResponse.json({ error: error?.message || 'Bulk sending failed.' }, { status: 500 });
  }
}