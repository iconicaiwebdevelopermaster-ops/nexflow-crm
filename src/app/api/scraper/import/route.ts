import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // Resolve User by Email
    const user = await prisma.user.findFirst({
      where: { email: { equals: session.user.email, mode: 'insensitive' } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

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
            niche: lead.niche || null,
            status: 'NEW'
          }
        });

        // Add Activity Log
        await prisma.activity.create({
          data: {
            leadId: created.id,
            type: 'NOTE_ADDED',
            title: `Lead imported via NexScraper (${lead.source || 'Engine'})`
          }
        });

        importedCount++;
      } catch (duplicateErr) {
        // Skip duplicate email silently
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