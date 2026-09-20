import prisma from '@/lib/prisma';

export const PLAN_LIMITS = {
  FREE: 20,
  PRO: 500,
  AGENCY: 2000,
};

export async function checkAndIncrementQuota(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  const plan = user?.plan || 'FREE';
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || 20;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const sentTodayCount = await prisma.emailSent.count({
    where: {
      userId,
      createdAt: { gte: startOfDay },
      status: 'SENT',
    },
  });

  if (sentTodayCount >= limit) {
    return { allowed: false, remaining: 0, limit };
  }

  return { allowed: true, remaining: limit - sentTodayCount, limit };
}
