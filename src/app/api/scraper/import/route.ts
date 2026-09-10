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
      return NextResponse.json({ error: 'User account not found.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const rawLeads = body?.leads || body?.selectedLeads || body?.data || (Array.isArray(body) ? body : []);

    if (!Array.isArray(rawLeads) || rawLeads.length === 0) {
      return NextResponse.json({ error: 'No scraped leads provided to import.' }, { status: 400 });
    }

    // Format leads for Prisma bulk insertion
    const validLeads = rawLeads.map((l: any) => ({
      name: l.name || l.company || 'Scraped Prospect',
      email: l.email || `contact@${(l.company || 'business').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      company: l.company || l.name || null,
      phone: l.phone || null,
      website: l.website || null,
      city: l.city || null,
      niche: l.niche || null,
      source: l.source || 'NexScraper v3.0 Engine',
      status: LeadStatus.NEW,
      userId: user.id,
    }));

    // Perform bulk create in Neon DB
    const created = await prisma.lead.createMany({
      data: validLeads,
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${created.count} scraped leads to your CRM!`,
      count: created.count,
    });

  } catch (error: any) {
    console.error('Scraper Import API Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to import scraped leads.' }, { status: 500 });
  }
}