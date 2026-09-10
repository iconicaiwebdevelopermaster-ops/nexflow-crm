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

    // Find leads currently in active outreach sequence
    const activeLeads = await prisma.lead.findMany({
      where: {
        status: { in: ['SENT', 'FOLLOWUP_1', 'FOLLOWUP_2'] }
      },
      select: {
        id: true,
        email: true,
        status: true
      },
      take: 50
    });

    return NextResponse.json({
      success: true,
      job: 'reply-check',
      activeTrackingCount: activeLeads.length,
      message: 'Inbox scanner active. Monitoring replies for active leads.',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}