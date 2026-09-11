import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

async function getOrCreateUser(email: string) {
  const cleanEmail = email.toLowerCase().trim();
  let user = await prisma.user.findFirst({
    where: { email: { equals: cleanEmail, mode: 'insensitive' } }
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash('master123', 10);
    const isMaster = cleanEmail === 'iconicaiwebdevelopermaster@gmail.com';
    user = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: 'Iconic User',
        role: isMaster ? 'SUPER_ADMIN' : 'USER',
        fromName: 'Iconic Usama',
        promoteSite: 'besttradelogic.com',
        promoteTopic: 'AI Web Development & CRM Automation',
        dailyLimit: 40,
        aiEnabled: true,
        aiProvider: 'deepseek'
      }
    });
  }
  return user;
}

export async function GET() {
  try {
    const session = await auth();
    const sessionEmail = session?.user?.email || 'iconicaiwebdevelopermaster@gmail.com';
    const user = await getOrCreateUser(sessionEmail);

    // Fetch sent emails
    const emailsSent = await prisma.emailSent.findMany({
      where: { userId: user.id },
      include: { lead: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Fetch activity logs for sent emails
    const emailActivities = await prisma.activity.findMany({
      where: {
        type: 'EMAIL_SENT',
        lead: { userId: user.id }
      },
      include: { lead: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    const formatted: any[] = [];

    for (const e of emailsSent) {
      formatted.push({
        id: e.id,
        recipient: e.lead?.email || e.recipientEmail || 'Unknown',
        leadName: e.lead?.name || 'Contact',
        company: e.lead?.company || 'Company',
        subject: e.subject || 'Outreach Email',
        body: e.body || '',
        status: e.status || 'SENT',
        sentAt: e.sentAt || e.createdAt
      });
    }

    for (const act of emailActivities) {
      if (!formatted.some(f => f.recipient === act.lead?.email)) {
        formatted.push({
          id: act.id,
          recipient: act.lead?.email || 'Contact',
          leadName: act.lead?.name || 'Contact',
          company: act.lead?.company || 'Company',
          subject: act.title || 'Outreach Campaign',
          body: 'Sent via NexFlow Campaign Dispatcher',
          status: 'SENT',
          sentAt: act.createdAt
        });
      }
    }

    return NextResponse.json({ success: true, emails: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: true, emails: [], error: error.message });
  }
}