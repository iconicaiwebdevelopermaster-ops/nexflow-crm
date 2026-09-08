export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextRequest, NextResponse } from 'next/server';
import { generatePersonalizedEmail } from '@/lib/ai-composer';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { leadName, companyName, niche, city, website, userOffering, tone } = body;

    if (!leadName) {
      return NextResponse.json({ error: 'Missing leadName' }, { status: 400 });
    }

    const emailContent = await generatePersonalizedEmail({
      leadName,
      companyName,
      niche,
      city,
      website,
      userOffering: userOffering || 'Premium AI Automation & Software Systems',
      tone: tone || 'professional',
    });

    return NextResponse.json({ success: true, ...emailContent });
  } catch (error: any) {
    console.error('AI Composer API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}