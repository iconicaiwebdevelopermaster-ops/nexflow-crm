import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { LeadStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const leads = await prisma.lead.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error('GET /api/leads error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { name, email, company, phone, website, city, niche, notes, status } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
    }

    const newLead = await prisma.lead.create({
      data: {
        name,
        email,
        company: company || null,
        phone: phone || null,
        website: website || null,
        city: city || null,
        niche: niche || null,
        notes: notes || null,
        status: (status as LeadStatus) || LeadStatus.NEW,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error: any) {
    console.error('POST /api/leads error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}