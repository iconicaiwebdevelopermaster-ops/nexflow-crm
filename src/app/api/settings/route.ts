import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: session.user.email, mode: 'insensitive' } }
    });

    if (!user) {
      return NextResponse.json({ success: true, settings: {} });
    }

    const settings = {
      fromName: (user as any).fromName || '',
      promoteSite: (user as any).promoteSite || '',
      promoteTopic: (user as any).promoteTopic || '',
      dailyLimit: (user as any).dailyLimit || 40,
      mapsApiKey: (user as any).mapsApiKey || '',
      cseApiKey: (user as any).cseApiKey || '',
      cseCx: (user as any).cseCx || '',
      aiEnabled: (user as any).aiEnabled || false,
      aiProvider: (user as any).aiProvider || 'deepseek',
      aiModel: (user as any).aiModel || '',
      deepseekApiKey: (user as any).deepseekApiKey || '',
      openaiApiKey: (user as any).openaiApiKey || '',
      aiExtraPrompt: (user as any).aiExtraPrompt || '',
      smtpHost: user.smtpHost || '',
      smtpPort: user.smtpPort || 465,
      smtpUser: user.smtpUser || ''
    };

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const user = await prisma.user.findFirst({
      where: { email: { equals: session.user.email, mode: 'insensitive' } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        fromName: body.fromName || null,
        promoteSite: body.promoteSite || null,
        promoteTopic: body.promoteTopic || null,
        dailyLimit: body.dailyLimit ? parseInt(body.dailyLimit, 10) : 40,
        mapsApiKey: body.mapsApiKey || null,
        cseApiKey: body.cseApiKey || null,
        cseCx: body.cseCx || null,
        aiEnabled: Boolean(body.aiEnabled),
        aiProvider: body.aiProvider || 'deepseek',
        aiModel: body.aiModel || null,
        deepseekApiKey: body.deepseekApiKey || null,
        openaiApiKey: body.openaiApiKey || null,
        aiExtraPrompt: body.aiExtraPrompt || null,
      }
    });

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    console.error('Settings Save Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}