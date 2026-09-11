import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

async function getOrCreateUser(email: string, name?: string) {
  const cleanEmail = email.toLowerCase().trim();
  let user = await prisma.user.findFirst({
    where: { email: { equals: cleanEmail, mode: 'insensitive' } }
  });

  if (!user) {
    const hashedPassword = await bcrypt.hash('master123', 10);
    const isMaster = cleanEmail === 'iconicaiwebdevelopermaster@gmail.com';
    user = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: name || 'Iconic User',
        role: isMaster ? 'SUPER_ADMIN' : 'USER',
        fromName: name || 'Iconic Usama',
        promoteSite: 'besttradelogic.com',
        promoteTopic: 'AI Web Development & CRM Automation',
        dailyLimit: 40,
        aiEnabled: true,
        aiProvider: 'deepseek'
      }
    });
  }

  return user;
}

export async function GET() {
  try {
    const session = await auth();
    const sessionEmail = session?.user?.email || 'iconicaiwebdevelopermaster@gmail.com';

    const user = await getOrCreateUser(sessionEmail, session?.user?.name || undefined);

    const settings = {
      fromName: (user as any).fromName || 'Iconic Usama',
      fromEmail: user.email,
      promoteSite: (user as any).promoteSite || 'besttradelogic.com',
      promoteTopic: (user as any).promoteTopic || 'AI Web Development & CRM Automation',
      dailyLimit: (user as any).dailyLimit || 40,
      mapsApiKey: (user as any).mapsApiKey || '',
      cseApiKey: (user as any).cseApiKey || '',
      cseCx: (user as any).cseCx || '',
      aiEnabled: (user as any).aiEnabled ?? true,
      aiProvider: (user as any).aiProvider || 'deepseek',
      aiModel: (user as any).aiModel || '',
      deepseekApiKey: (user as any).deepseekApiKey || '',
      openaiApiKey: (user as any).openaiApiKey || '',
      aiExtraPrompt: (user as any).aiExtraPrompt || ''
    };

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const sessionEmail = session?.user?.email || 'iconicaiwebdevelopermaster@gmail.com';

    const user = await getOrCreateUser(sessionEmail, session?.user?.name || undefined);
    const body = await req.json();

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}