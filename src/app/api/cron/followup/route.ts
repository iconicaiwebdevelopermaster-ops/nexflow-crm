import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getGmailClientForUser } from '@/lib/gmail-client';
import nodemailer from 'nodemailer';
import { LeadStatus, EmailStatus, ActivityType } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FOLLOWUP_DELAY_DAYS = 4;
const MAX_FOLLOWUPS = 2;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    const expectedSecret = process.env.CRON_SECRET || 'nexflow-cron-secret-2026';
    const authHeader = req.headers.get('authorization');

    if (secret !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - FOLLOWUP_DELAY_DAYS);

    const dueLeads = await prisma.lead.findMany({
      where: {
        status: { in: ['SENT', 'FOLLOWUP_1'] },
        followupCount: { lt: MAX_FOLLOWUPS },
        updatedAt: { lte: cutoffDate },
      },
      include: {
        user: {
          include: {
            gmailAccounts: { where: { isActive: true } },
          },
        },
        emailsSent: { orderBy: { sentAt: 'desc' }, take: 1 },
      },
      take: 40,
    });

    if (dueLeads.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No follow-ups due at this time.',
        processedCount: 0,
      });
    }

    let successCount = 0;
    let failedCount = 0;

    for (const lead of dueLeads) {
      try {
        const user = lead.user;
        const lastEmail = lead.emailsSent[0];
        const nextFollowupNum = lead.followupCount + 1;
        const nextStatus = nextFollowupNum === 1 ? LeadStatus.FOLLOWUP_1 : LeadStatus.FOLLOWUP_2;

        let subject = `Re: ${lastEmail?.subject || 'Quick follow-up'}`;
        if (!subject.toLowerCase().startsWith('re:')) subject = `Re: ${subject}`;

        let body = '';
        if (nextFollowupNum === 1) {
          body = `Hi ${lead.name},\n\nJust following up on my previous message regarding ${lead.company || 'your business'}. I know things get busy!\n\nWould you be open to a quick 10-minute call this week?\n\nBest regards,\n${user.name || 'NexFlow Outreach'}`;
        } else {
          body = `Hi ${lead.name},\n\nI haven't heard back, so I assume improving patient/client acquisition isn't a priority right now.\n\nI won't bother you further, but if anything changes, feel free to reply directly to this thread.\n\nBest,\n${user.name || 'NexFlow Outreach'}`;
        }

        const gmailAccount = user.gmailAccounts[0];
        let messageId = '';
        let threadId = lastEmail?.gmailThreadId || '';

        if (gmailAccount) {
          const gmail = await getGmailClientForUser(user.id);
          const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
          
          const messageParts = [
            `From: ${gmailAccount.email}`,
            `To: ${lead.email}`,
            `Subject: ${utf8Subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            'Content-Transfer-Encoding: 7bit',
            '',
            body.replace(/\n/g, '<br/>'),
          ];

          const rawMessage = Buffer.from(messageParts.join('\r\n'))
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

          const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
              raw: rawMessage,
              threadId: threadId || undefined,
            },
          });

          messageId = res.data.id || '';
          threadId = res.data.threadId || threadId;

          await prisma.gmailAccount.update({
            where: { id: gmailAccount.id },
            data: { sentToday: { increment: 1 } },
          });
        } else if (user.smtpUser && user.smtpPass) {
          const transporter = nodemailer.createTransport({
            host: user.smtpHost || 'smtp.gmail.com',
            port: user.smtpPort || 587,
            secure: user.smtpPort === 465,
            auth: { user: user.smtpUser, pass: user.smtpPass },
          });

          const info = await transporter.sendMail({
            from: `"${user.name || 'NexFlow Outreach'}" <${user.smtpUser}>`,
            to: lead.email,
            subject,
            html: body.replace(/\n/g, '<br/>'),
          });

          messageId = info.messageId || '';
        } else {
          failedCount++;
          continue;
        }

        await prisma.$transaction([
          prisma.emailSent.create({
            data: {
              userId: user.id,
              leadId: lead.id,
              subject,
              body,
              gmailMessageId: messageId,
              gmailThreadId: threadId || null,
              isFollowup: true,
              followupNumber: nextFollowupNum,
              status: EmailStatus.SENT,
            },
          }),
          prisma.lead.update({
            where: { id: lead.id },
            data: {
              status: nextStatus,
              followupCount: nextFollowupNum,
              lastFollowupAt: new Date(),
            },
          }),
          prisma.activity.create({
            data: {
              leadId: lead.id,
              type: ActivityType.EMAIL_SENT,
              description: `Automated Follow-up #${nextFollowupNum} dispatched: "${subject}"`,
            },
          }),
        ]);

        successCount++;
      } catch (err: any) {
        failedCount++;
        console.error(`Followup failed for lead ${lead.email}:`, err.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Follow-up sequence run complete. ${successCount} sent, ${failedCount} failed.`,
      processedCount: successCount,
      failedCount,
    });
  } catch (error: any) {
    console.error('Followup Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}