import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LeadStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function extractLeadIds(body: any): string[] {
  const raw =
    body?.leadIds ??
    body?.ids ??
    body?.selectedIds ??
    body?.selectedLeadIds ??
    [];

  if (Array.isArray(raw)) {
    return raw
      .map((x) => (typeof x === 'string' ? x : x?.id))
      .filter((x): x is string => typeof x === 'string' && x.length > 0);
  }

  if (typeof raw === 'string' && raw.length > 0) {
    return [raw];
  }

  return [];
}

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

    const body = await req.json().catch(() => ({}));

    // IF RAW LEADS OBJECT ARRAY IS PASSED (IMPORT MODE)
    const rawLeads = body?.leads || body?.selectedLeads;
    if (Array.isArray(rawLeads) && rawLeads.length > 0 && typeof rawLeads[0] === 'object' && rawLeads[0].email) {
      const validLeads = rawLeads.map((l: any) => ({
        name: l.name || l.company || 'Scraped Prospect',
        email: l.email,
        company: l.company || l.name || null,
        phone: l.phone || null,
        website: l.website || null,
        city: l.city || null,
        niche: l.niche || null,
        source: l.source || 'NexScraper Engine',
        status: LeadStatus.NEW,
        userId: user.id,
      }));

      const created = await prisma.lead.createMany({
        data: validLeads,
        skipDuplicates: true,
      });

      return NextResponse.json({
        success: true,
        message: `${created.count} leads imported to CRM!`,
        count: created.count,
      });
    }

    // ID-BASED ACTIONS (DELETE / UPDATE STATUS)
    const leadIds = extractLeadIds(body);
    const action = body?.action || body?.type || body?.op || '';
    const status = body?.status;

    if (leadIds.length === 0) {
      return NextResponse.json(
        {
          error: 'No lead IDs provided.',
          receivedKeys: Object.keys(body || {}),
        },
        { status: 400 }
      );
    }

    if (action === 'DELETE' || action === 'delete') {
      const deleted = await prisma.lead.deleteMany({
        where: { id: { in: leadIds }, userId: user.id },
      });
      return NextResponse.json({
        success: true,
        count: deleted.count,
        message: `${deleted.count} leads deleted.`,
      });
    }

    if ((action === 'UPDATE_STATUS' || action === 'update_status' || action === 'status') && status) {
      const updated = await prisma.lead.updateMany({
        where: { id: { in: leadIds }, userId: user.id },
        data: { status: status as LeadStatus },
      });
      return NextResponse.json({
        success: true,
        count: updated.count,
        message: `${updated.count} leads updated to ${status}.`,
      });
    }

    return NextResponse.json(
      { error: 'Invalid bulk action.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Bulk Leads API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}