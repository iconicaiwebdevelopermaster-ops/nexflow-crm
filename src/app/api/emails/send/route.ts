import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getGmailClientForUser } from '@/lib/gmail-client';
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

    // 1. Fetch Lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead || lead.userId !== session.user.id) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // 2. Fetch Connected Gmail Account & Check Daily Quota
    const gmailAccount = await prisma.gmailAccount.findFirst({
      where: { userId: session.user.id, isActive: true },
    });

    if (!gmailAccount) {
      return NextResponse.json(
        { error: 'No active Gmail account found. Please connect your Gmail in Settings.' },
        { status: 400 }
      );
    }

    if (gmailAccount.sentToday >= gmailAccount.dailyQuota) {
      return NextResponse.json(
        { error: `Daily sending limit reached (${gmailAccount.dailyQuota}/day). Try again tomorrow.` },
        { status: 429 }
      );
    }

    // 3. Prepare RFC 2822 Email Format
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

    // 4. Send via Gmail API
    const gmail = await getGmailClientForUser(session.user.id);
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: rawMessage,
      },
    });

    const gmailMessageId = response.data.id || '';
    const gmailThreadId = response.data.threadId || '';

    // 5. Database Transaction (Log Email + Update Lead Status + Activity + Update Quota)
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
      prisma.gmailAccount.update({
        where: { id: gmailAccount.id },
        data: { sentToday: { increment: 1 } },
      }),
      prisma.activity.create({
        data: {
          leadId: lead.id,
          type: ActivityType.EMAIL_SENT,
          description: `Cold email sent via Gmail API: "${subject}"`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully via Gmail API!',
      gmailMessageId,
      gmailThreadId,
    });
  } catch (error: any) {
    console.error('Email Sending Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to send email via Gmail API' },
      { status: 500 }
    );
  }
}