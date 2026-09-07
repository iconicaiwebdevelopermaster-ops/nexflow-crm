import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { LeadStatus, ActivityType } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { leadId, status } = body;

    if (!leadId || !status) {
      return NextResponse.json({ error: 'Missing leadId or status' }, { status: 400 });
    }

    if (!Object.values(LeadStatus).includes(status as LeadStatus)) {
      return NextResponse.json({ error: `Invalid status value: ${status}` }, { status: 400 });
    }

    const existingLead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!existingLead || existingLead.userId !== session.user.id) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    const updatedLead = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.update({
        where: { id: leadId },
        data: { status: status as LeadStatus },
      });

      await tx.activity.create({
        data: {
          leadId,
          type: ActivityType.STAGE_MOVED,
          description: `Lead moved from ${existingLead.status} to ${status}`,
        },
      });

      return lead;
    });

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    console.error('Update Status Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}