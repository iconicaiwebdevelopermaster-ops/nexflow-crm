import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRepliesForUser } from '@/lib/reply-detector';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');

    // Simple security validation
    const expectedSecret = process.env.CRON_SECRET || 'nexflow-cron-secret-2026';
    const authHeader = req.headers.get('authorization');

    if (secret !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
    }

    // Find all users with active Gmail OAuth accounts
    const activeGmailAccounts = await prisma.gmailAccount.findMany({
      where: { isActive: true },
      select: { userId: true, email: true },
    });

    let totalRepliesDetected = 0;
    const results: any[] = [];

    for (const acc of activeGmailAccounts) {
      const res = await checkRepliesForUser(acc.userId);
      if (res.success && res.detectedCount) {
        totalRepliesDetected += res.detectedCount;
      }
      results.push({ email: acc.email, ...res });
    }

    return NextResponse.json({
      success: true,
      message: `Reply check complete. ${totalRepliesDetected} new replies detected!`,
      totalRepliesDetected,
      accountsChecked: activeGmailAccounts.length,
      details: results,
    });
  } catch (error: any) {
    console.error('Reply Check Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}