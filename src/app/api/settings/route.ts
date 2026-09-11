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
      where: { email: { equals: session.user.email, mode: 'insensitive' } },
      select: {
        smtpHost: true,
        smtpPort: true,
        smtpUser: true,
        fromName: true,
        promoteSite: true,
        promoteTopic: true,
        dailyLimit: true,
        mapsApiKey: true,
        cseApiKey: true,
        cseCx: true,
        aiEnabled: true,
        aiProvider: true,
        aiModel: true,
        deepseekApiKey: true,
        openaiApiKey: true,
        aiExtraPrompt: true,
      }
    });

    return NextResponse.json({ success: true, settings: user || {} });
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
        aiProvider: body.aiProvider || 'openai',
        aiModel: body.aiModel || null,
        deepseekApiKey: body.deepseekApiKey || null,
        openaiApiKey: body.openaiApiKey || null,
        aiExtraPrompt: body.aiExtraPrompt || null,
      }
    });

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}