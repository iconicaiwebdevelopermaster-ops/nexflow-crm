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

export async function POST(req: Request) {
  try {
    const session = await auth();
    const sessionEmail = session?.user?.email || 'iconicaiwebdevelopermaster@gmail.com';
    const user = await getOrCreateUser(sessionEmail);

    const body = await req.json();
    const leadsToImport = body.leads || body.selectedLeads || [];

    if (!Array.isArray(leadsToImport) || leadsToImport.length === 0) {
      return NextResponse.json({ error: 'No valid leads provided for import' }, { status: 400 });
    }

    let importedCount = 0;

    for (const lead of leadsToImport) {
      if (!lead.email) continue;

      try {
        const created = await prisma.lead.create({
          data: {
            userId: user.id,
            name: lead.name || 'Unknown Contact',
            company: lead.company || 'Business Entity',
            email: lead.email.toLowerCase().trim(),
            phone: lead.phone || null,
            website: lead.website || null,
            city: lead.city || null,
            country: lead.country || null,
            niche: lead.niche || null,
            status: 'NEW'
          }
        });

        await prisma.activity.create({
          data: {
            leadId: created.id,
            type: 'NOTE_ADDED',
            title: `Lead imported via NexScraper (${lead.source || 'Harvester'})`
          }
        });

        importedCount++;
      } catch (duplicateErr) {
        // Skip duplicate
      }
    }

    return NextResponse.json({
      success: true,
      count: importedCount,
      message: `Successfully imported ${importedCount} leads to CRM`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
