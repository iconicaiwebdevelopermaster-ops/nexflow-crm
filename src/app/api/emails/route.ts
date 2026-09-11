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

    // Query EmailSent Table
    const emailsSent = await prisma.emailSent.findMany({
      where: { userId: user.id },
      include: { lead: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    // Query Leads with status SENT as fallback
    const sentLeads = await prisma.lead.findMany({
      where: { userId: user.id, status: 'SENT' },
      orderBy: { updatedAt: 'desc' },
      take: 100
    });

    const formatted: any[] = [];
    const seenEmails = new Set<string>();

    for (const e of emailsSent) {
      const emailAddr = e.recipientEmail || e.lead?.email || 'Contact';
      seenEmails.add(emailAddr.toLowerCase());
      formatted.push({
        id: e.id,
        recipient: emailAddr,
        leadName: e.lead?.name || 'Contact',
        company: e.lead?.company || 'Company',
        subject: e.subject || 'Outreach Email',
        body: e.body || '',
        status: e.status || 'SENT',
        sentAt: e.sentAt || e.createdAt
      });
    }

    for (const lead of sentLeads) {
      if (!seenEmails.has(lead.email.toLowerCase())) {
        formatted.push({
          id: lead.id,
          recipient: lead.email,
          leadName: lead.name,
          company: lead.company,
          subject: `Campaign Pitch (${lead.company})`,
          body: 'Outreach campaign dispatched',
          status: 'SENT',
          sentAt: lead.updatedAt
        });
      }
    }

    return NextResponse.json({ success: true, count: formatted.length, emails: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: true, emails: [], error: error.message });
  }
}