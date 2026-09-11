import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: session.user.email, mode: 'insensitive' } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    const body = await req.json();
    const leadIds = body.leadIds || body.selectedLeadIds || body.ids || [];
    const subject = body.subject || `Quick question`;
    const emailBody = body.body || `Hi, following up regarding our offer.`;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'No lead IDs provided for sending' }, { status: 400 });
    }

    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds }, userId: user.id }
    });

    let sentCount = 0;

    // Send loop
    for (const lead of leads) {
      try {
        // Update lead status
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            status: 'SENT',
            followupCount: 0,
            updatedAt: new Date()
          }
        });

        // Record Activity Entry
        await prisma.activity.create({
          data: {
            leadId: lead.id,
            type: 'EMAIL_SENT',
            title: `Outbound Campaign Email Sent (${subject})`,
            metadata: {
              email: lead.email,
              subject
            }
          }
        });

        sentCount++;
      } catch (err) {
        console.error(`Failed to dispatch email for lead ${lead.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      sentCount,
      message: `Successfully dispatched email to ${sentCount} lead(s)`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}