import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { smtpHost, smtpPort, smtpUser, smtpPass } = body;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: 'Email/Username and Password are required for SMTP.' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        smtpHost: smtpHost || 'smtp.gmail.com',
        smtpPort: parseInt(smtpPort) || 587,
        smtpUser,
        smtpPass,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Manual SMTP credentials saved successfully!',
    });
  } catch (error: any) {
    console.error('SMTP Settings Save Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}