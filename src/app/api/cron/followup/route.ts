import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET && secret !== 'nexflow-cron-secret-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3-day follow-up delay
    const thresholdDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    // Find eligible leads from database
    const eligibleLeads = await prisma.lead.findMany({
      where: {
        status: { in: ['SENT', 'FOLLOWUP_1'] },
        updatedAt: { lte: thresholdDate },
        followupCount: { lt: 2 }
      },
      include: {
        user: true
      },
      take: 25
    });

    let processedCount = 0;

    for (const lead of eligibleLeads) {
      try {
        const nextStatus = lead.status === 'SENT' ? 'FOLLOWUP_1' : 'FOLLOWUP_2';

        // Advance Lead Status
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            status: nextStatus,
            followupCount: { increment: 1 }
          }
        });

        // Record Activity Entry
        await prisma.activity.create({
          data: {
            leadId: lead.id,
            type: 'FOLLOWUP_SCHEDULED',
            title: `Automated Follow-up #${lead.followupCount + 1} (${nextStatus})`,
            metadata: { 
              previousStatus: lead.status,
              updatedStatus: nextStatus,
              leadEmail: lead.email 
            }
          }
        });

        processedCount++;
      } catch (err: any) {
        console.error(`Error processing followup for lead ${lead.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      job: 'followup',
      scannedLeads: eligibleLeads.length,
      processedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}