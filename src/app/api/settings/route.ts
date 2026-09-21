import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ── GET: User ki Personal Settings Load Karein ──
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email && !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email?.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { email: { equals: userEmail, mode: 'insensitive' } },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const settings = {
      fromName: user.fromName || user.name || '',
      fromEmail: user.fromEmail || user.email || '',
      promoteSite: user.promoteSite || '',
      promoteTopic: user.promoteTopic || '',
      dailyLimit: user.dailyLimit || 40,
      aiEnabled: user.aiEnabled ?? true,
      aiProvider: user.aiProvider || 'deepseek',
      aiExtraPrompt: user.aiExtraPrompt || '',
      deepseekApiKey: user.deepseekApiKey || '',
      openaiApiKey: user.openaiApiKey || '',
      mapsApiKey: user.mapsApiKey || '',
      cseApiKey: user.cseApiKey || '',
      cseCx: user.cseCx || '',
      smtpUser: user.smtpUser || '',
      smtpPass: user.smtpPass ? '••••••••••••' : '',
      plan: user.plan || 'FREE',
      role: user.role || 'USER',
    };

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

// ── POST: User ki Settings Update Karein (Safe Whitelist) ──
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email && !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email?.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { email: { equals: userEmail, mode: 'insensitive' } },
    });

    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    const body = await req.json();

    // Whitelist STRICTLY matching Prisma Schema to prevent runtime crashing
    const updateData: any = {};

    if (body.fromName !== undefined) updateData.fromName = body.fromName || null;
    if (body.fromEmail !== undefined) updateData.fromEmail = body.fromEmail || null;
    if (body.promoteSite !== undefined) updateData.promoteSite = body.promoteSite || null;
    if (body.promoteTopic !== undefined) updateData.promoteTopic = body.promoteTopic || null;
    if (body.dailyLimit !== undefined) updateData.dailyLimit = parseInt(body.dailyLimit, 10) || 40;
    if (body.aiEnabled !== undefined) updateData.aiEnabled = Boolean(body.aiEnabled);
    if (body.aiProvider !== undefined) updateData.aiProvider = body.aiProvider || 'deepseek';
    if (body.aiExtraPrompt !== undefined) updateData.aiExtraPrompt = body.aiExtraPrompt || null;
    if (body.deepseekApiKey !== undefined) updateData.deepseekApiKey = body.deepseekApiKey || null;
    if (body.openaiApiKey !== undefined) updateData.openaiApiKey = body.openaiApiKey || null;
    if (body.mapsApiKey !== undefined) updateData.mapsApiKey = body.mapsApiKey || null;
    if (body.cseApiKey !== undefined) updateData.cseApiKey = body.cseApiKey || null;
    if (body.cseCx !== undefined) updateData.cseCx = body.cseCx || null;
    if (body.smtpUser !== undefined) updateData.smtpUser = body.smtpUser || null;
    if (body.smtpPass && body.smtpPass !== '••••••••••••') updateData.smtpPass = body.smtpPass;

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    console.error('Settings POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save settings' }, { status: 500 });
  }
}