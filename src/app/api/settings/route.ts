import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ── GET: Logged-in User ki Personal Settings Fetch Karein ──
export async function GET() {
  try {
    const session = await auth();
    
    // Agar user logged in nahi hai toh strictly 401 dein (kisi doosre ka data leak na ho)
    if (!session?.user?.email && !session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email?.toLowerCase().trim();

    // User find karein
    const user = await prisma.user.findFirst({
      where: userId ? { id: userId } : { email: { equals: userEmail, mode: 'insensitive' } },
      select: {
        id: true,
        name: true,
        email: true,
        fromName: true,
        fromEmail: true,
        promoteSite: true,
        promoteTopic: true,
        aiProvider: true,
        aiExtraPrompt: true,
        smtpUser: true,
        smtpPass: true,
        plan: true,
        role: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Dynamic settings — New user ke liye fields CLEAN / EMPTY hongi
    const settings = {
      fromName: user.fromName || user.name || '',
      fromEmail: user.fromEmail || user.email || '',
      promoteSite: user.promoteSite || '',
      promoteTopic: user.promoteTopic || '',
      aiProvider: user.aiProvider || 'deepseek',
      aiExtraPrompt: user.aiExtraPrompt || '',
      smtpUser: user.smtpUser || '',
      smtpPass: user.smtpPass ? '••••••••••••' : '', // Security: Password frontend ko plain text me nahi bhejte
      plan: user.plan || 'FREE',
      role: user.role || 'USER',
    };

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

// ── POST: Logged-in User ki Settings Update Karein ──
export async function POST(req: Request) {
  try {
    const session = await auth();

    // Security check: Must be logged in
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

    // Data build karein strictly matching schema.prisma
    const updateData: any = {
      fromName: body.fromName !== undefined ? body.fromName : user.fromName,
      fromEmail: body.fromEmail !== undefined ? body.fromEmail : user.fromEmail,
      promoteSite: body.promoteSite !== undefined ? body.promoteSite : user.promoteSite,
      promoteTopic: body.promoteTopic !== undefined ? body.promoteTopic : user.promoteTopic,
      aiProvider: body.aiProvider || user.aiProvider || 'deepseek',
      aiExtraPrompt: body.aiExtraPrompt !== undefined ? body.aiExtraPrompt : user.aiExtraPrompt,
      smtpUser: body.smtpUser !== undefined ? body.smtpUser : user.smtpUser,
    };

    // Agar password change kiya hai (aur mask wala placeholder nahi hai) toh save karein
    if (body.smtpPass && body.smtpPass !== '••••••••••••') {
      updateData.smtpPass = body.smtpPass;
    }

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