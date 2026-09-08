export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getGmailClientForUser } from '@/lib/gmail-client';
import nodemailer from 'nodemailer';
import { LeadStatus, EmailStatus, ActivityType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { leadId, subject, body: emailBody, templateId } = body;

    if (!leadId || !subject || !emailBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Fetch Lead & User
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.userId !== session.user.id) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    // 2. Check for Active Gmail OAuth Account (PRIMARY MODE)
    const gmailAccount = await prisma.gmailAccount.findFirst({
      where: { userId: session.user.id, isActive: true },
    });

    let sentVia = '';
    let gmailMessageId = '';
    let gmailThreadId = '';

    if (gmailAccount) {
      // MODE 1: GMAIL OAUTH API
      if (gmailAccount.sentToday >= gmailAccount.dailyQuota) {
        return NextResponse.json(
          { error: `Daily sending limit reached (${gmailAccount.dailyQuota}/day).` },
          { status: 429 }
        );
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

      const gmail = await getGmailClientForUser(session.user.id);
      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: rawMessage },
      });

      gmailMessageId = response.data.id || '';
      gmailThreadId = response.data.threadId || '';
      sentVia = 'Gmail OAuth API';

      // Increment daily quota count
      await prisma.gmailAccount.update({
        where: { id: gmailAccount.id },
        data: { sentToday: { increment: 1 } },
      });

    } else if (user?.smtpUser && user?.smtpPass) {
      // MODE 2: MANUAL SMTP FALLBACK (Nodemailer / App Password)
      const transporter = nodemailer.createTransport({
        host: user.smtpHost || 'smtp.gmail.com',
        port: user.smtpPort || 587,
        secure: user.smtpPort === 465,
        auth: {
          user: user.smtpUser,
          pass: user.smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"${user.name || 'NexFlow Outreach'}" <${user.smtpUser}>`,
        to: lead.email,
        subject: subject,
        html: emailBody.replace(/\n/g, '<br/>'),
      });

      gmailMessageId = info.messageId || '';
      sentVia = `Manual SMTP (${user.smtpHost || 'smtp.gmail.com'})`;

    } else {
      return NextResponse.json(
        {
          error:
            'No sending channel configured. Please connect Gmail OAuth OR configure Manual SMTP in Settings.',
        },
        { status: 400 }
      );
    }

    // 3. Log Transaction in Neon DB
    await prisma.$transaction([
      prisma.emailSent.create({
        data: {
          userId: session.user.id,
          leadId: lead.id,
          templateId: templateId || null,
          subject,
          body: emailBody,
          gmailMessageId,
          gmailThreadId,
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
          description: `Email sent via ${sentVia}: "${subject}"`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Email sent successfully via ${sentVia}!`,
      sentVia,
      gmailMessageId,
      gmailThreadId,
    });

  } catch (error: any) {
    console.error('Email Sending Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send email.' },
      { status: 500 }
    );
  }
}