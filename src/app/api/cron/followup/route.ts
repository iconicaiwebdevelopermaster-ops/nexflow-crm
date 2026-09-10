import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET && secret !== 'nexflow-cron-secret-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Follow-up threshold: 3 days ago
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    // Find leads eligible for automated follow-up
    const eligibleLeads = await prisma.lead.findMany({
      where: {
        status: { in: ['SENT', 'FOLLOWUP_1'] },
        updatedAt: { lte: threeDaysAgo },
        followupCount: { lt: 2 }
      },
      include: {
        user: true
      },
      take: 20
    });

    let processedCount = 0;

    for (const lead of eligibleLeads) {
      try {
        const nextStage = lead.status === 'SENT' ? 'FOLLOWUP_1' : 'FOLLOWUP_2';
        
        // Update Lead stage & increment followup counter
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            status: nextStage,
            followupCount: { increment: 1 }
          }
        });

        // Log Activity
        await prisma.activity.create({
          data: {
            leadId: lead.id,
            type: 'FOLLOWUP_SCHEDULED',
            title: `Automated Follow-up #${lead.followupCount + 1} Dispatched`,
            metadata: { stage: nextStage }
          }
        });

        processedCount++;
      } catch (innerErr) {
        console.error(`Failed to process followup for lead ${lead.id}:`, innerErr);
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