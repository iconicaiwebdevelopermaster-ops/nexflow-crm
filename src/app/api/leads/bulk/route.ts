import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LeadStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 401 });
    }

    const body = await req.json();
    const { action, leadIds, status } = body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'No lead IDs provided.' }, { status: 400 });
    }

    if (action === 'DELETE') {
      const deleted = await prisma.lead.deleteMany({
        where: {
          id: { in: leadIds },
          userId: user.id,
        },
      });

      return NextResponse.json({ success: true, count: deleted.count, message: `${deleted.count} leads deleted.` });
    }

    if (action === 'UPDATE_STATUS' && status) {
      const updated = await prisma.lead.updateMany({
        where: {
          id: { in: leadIds },
          userId: user.id,
        },
        data: {
          status: status as LeadStatus,
        },
      });

      return NextResponse.json({ success: true, count: updated.count, message: `${updated.count} leads updated to ${status}.` });
    }

    return NextResponse.json({ error: 'Invalid action or missing status.' }, { status: 400 });

  } catch (error: any) {
    console.error('Bulk Leads API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}