import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email?.toLowerCase();

    // Verify Super Admin access
    const adminUser = await prisma.user.findFirst({
      where: { email: { equals: userEmail, mode: 'insensitive' } }
    });

    if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Super Admin access required' }, { status: 403 });
    }

    const { action, targetUserId } = await req.json();

    if (!action || !targetUserId) {
      return NextResponse.json({ error: 'Missing action or targetUserId' }, { status: 400 });
    }

    if (action === 'promote') {
      await prisma.user.update({
        where: { id: targetUserId },
        data: { role: 'ADMIN' }
      });
      return NextResponse.json({ success: true, message: 'User promoted to ADMIN' });
    }

    if (action === 'demote') {
      await prisma.user.update({
        where: { id: targetUserId },
        data: { role: 'USER' }
      });
      return NextResponse.json({ success: true, message: 'User demoted to USER' });
    }

    if (action === 'delete') {
      await prisma.user.delete({
        where: { id: targetUserId }
      });
      return NextResponse.json({ success: true, message: 'User and workspace data purged' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}